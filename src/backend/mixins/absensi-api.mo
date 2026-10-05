import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/absensi";
import SesiTypes "../types/sesi";
import Common "../types/common";
import AbsensiLib "../lib/absensi";

mixin (
  absensi : Map.Map<Text, Types.Absensi>,
  sesi : Map.Map<Common.SesiId, SesiTypes.Sesi>,
  ketuaHalaqah : Map.Map<Principal, [Common.KelompokId]>,
  accessControlState : AccessControl.AccessControlState,
) {
  func pastikanPengurus(caller : Principal) {
    let peran = AccessControl.getUserRole(accessControlState, caller);
    if (peran == #guest) {
      Runtime.trap("Hanya pengurus yang dapat mengisi absensi");
    };
  };

  // Admin boleh semua kelompok; pengurus lain hanya kelompok yang terdaftar.
  func bolehKelompok(caller : Principal, kelompokId : Common.KelompokId) : Bool {
    if (AccessControl.isAdmin(accessControlState, caller)) { return true };
    switch (ketuaHalaqah.get(caller)) {
      case (?daftar) { daftar.contains(kelompokId) };
      case null { false };
    };
  };

  public shared ({ caller }) func simpanAbsensi(input : Types.SimpanAbsensiInput) : async Types.RingkasanStatus {
    pastikanPengurus(caller);
    let s = switch (sesi.get(input.sesiId)) {
      case (?s) { s };
      case null { Runtime.trap("Sesi tidak ditemukan") };
    };
    if (not bolehKelompok(caller, s.kelompokId)) {
      Runtime.trap("Anda hanya dapat mengisi absensi kelompok Anda");
    };
    AbsensiLib.simpanAbsensi(absensi, sesi, input, ?caller);
  };

  public query func getAbsensiSesi(sesiId : Common.SesiId) : async [Types.Absensi] {
    AbsensiLib.getAbsensiSesi(absensi, sesiId);
  };

  public query func ringkasanSesi(sesiId : Common.SesiId) : async Types.RingkasanStatus {
    AbsensiLib.ringkasanSesi(absensi, sesiId);
  };

  public shared ({ caller }) func checkIn(input : Types.CheckInInput) : async Types.Absensi {
    ignore caller;
    AbsensiLib.checkIn(absensi, sesi, input, Time.now());
  };

  // --- Registri ketua halaqah (dikelola admin) ---

  public shared ({ caller }) func daftarkanKetuaHalaqah(principal : Principal, kelompokId : Common.KelompokId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Hanya admin yang dapat mendaftarkan ketua halaqah");
    };
    let lama = ketuaHalaqah.get(principal) ?? [];
    if (not lama.contains(kelompokId)) {
      ketuaHalaqah.add(principal, lama.concat([kelompokId]));
    };
  };

  public shared ({ caller }) func hapusKetuaHalaqah(principal : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Hanya admin yang dapat menghapus ketua halaqah");
    };
    ketuaHalaqah.remove(principal);
  };

  public query ({ caller }) func getKelompokSaya() : async [Common.KelompokId] {
    ketuaHalaqah.get(caller) ?? [];
  };
};
