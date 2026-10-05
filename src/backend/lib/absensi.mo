import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Types "../types/absensi";
import SesiTypes "../types/sesi";
import Common "../types/common";

module {
  // Kunci absensi: gabungan sesiId dan pesertaId agar unik per sesi/peserta.
  public func kunci(sesiId : Common.SesiId, pesertaId : Common.PesertaId) : Text {
    sesiId.toText() # ":" # pesertaId.toText();
  };

  func ringkasanDari(daftar : [Types.Absensi]) : Types.RingkasanStatus {
    var hadir = 0;
    var izin = 0;
    var sakit = 0;
    var alpa = 0;
    for (a in daftar.values()) {
      switch (a.status) {
        case (#hadir) { hadir += 1 };
        case (#izin) { izin += 1 };
        case (#sakit) { sakit += 1 };
        case (#alpa) { alpa += 1 };
      };
    };
    { hadir; izin; sakit; alpa; total = daftar.size() };
  };

  public func simpanAbsensi(
    absensi : Map.Map<Text, Types.Absensi>,
    sesi : Map.Map<Common.SesiId, SesiTypes.Sesi>,
    input : Types.SimpanAbsensiInput,
    pencatat : ?Principal,
  ) : Types.RingkasanStatus {
    ignore (sesi.get(input.sesiId) ?? Runtime.trap("Sesi tidak ditemukan"));
    let waktu = Time.now();
    for (item in input.daftar.values()) {
      let k = kunci(input.sesiId, item.pesertaId);
      let record : Types.Absensi = {
        sesiId = input.sesiId;
        pesertaId = item.pesertaId;
        status = item.status;
        catatan = item.catatan;
        dicatatOleh = pencatat;
        waktuCatat = waktu;
      };
      absensi.add(k, record);
    };
    ringkasanSesi(absensi, input.sesiId);
  };

  public func getAbsensiSesi(
    absensi : Map.Map<Text, Types.Absensi>,
    sesiId : Common.SesiId,
  ) : [Types.Absensi] {
    let hasil = absensi.values().filter(func(a) { a.sesiId == sesiId });
    hasil.toArray();
  };

  public func ringkasanSesi(
    absensi : Map.Map<Text, Types.Absensi>,
    sesiId : Common.SesiId,
  ) : Types.RingkasanStatus {
    ringkasanDari(getAbsensiSesi(absensi, sesiId));
  };

  public func checkIn(
    absensi : Map.Map<Text, Types.Absensi>,
    sesi : Map.Map<Common.SesiId, SesiTypes.Sesi>,
    input : Types.CheckInInput,
    sekarang : Common.Timestamp,
  ) : Types.Absensi {
    // Cari sesi dengan token yang cocok.
    let target = sesi.values().find(func(s) {
      switch (s.checkInToken) {
        case (?t) { t == input.token };
        case null { false };
      };
    });
    let s = switch (target) {
      case (?s) { s };
      case null { Runtime.trap("Token check-in tidak valid") };
    };
    if (sekarang < s.jendelaMulai or sekarang > s.jendelaSelesai) {
      Runtime.trap("Di luar jendela waktu sesi");
    };
    let k = kunci(s.id, input.pesertaId);
    let record : Types.Absensi = {
      sesiId = s.id;
      pesertaId = input.pesertaId;
      status = #hadir;
      catatan = "";
      dicatatOleh = null;
      waktuCatat = sekarang;
    };
    absensi.add(k, record);
    record;
  };
};
