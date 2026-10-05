import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type OldActor = {};

  type Peserta = { id : Nat; nama : Text; kelompokId : Text };
  type MataPelajaran = { id : Nat; nama : Text };
  type MediaSesi = { #tatapMuka; #zoom; #whatsapp };
  type Sesi = {
    id : Nat;
    tanggal : Int;
    kelompokId : Text;
    mapelId : Nat;
    pemateri : Text;
    media : MediaSesi;
    tempat : ?Text;
    jendelaMulai : Int;
    jendelaSelesai : Int;
    checkInToken : ?Text;
  };
  type StatusAbsensi = { #hadir; #izin; #sakit; #alpa };
  type Absensi = {
    sesiId : Nat;
    pesertaId : Nat;
    status : StatusAbsensi;
    catatan : Text;
    dicatatOleh : ?Principal;
    waktuCatat : Int;
  };

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    peserta : Map.Map<Nat, Peserta>;
    mapel : Map.Map<Nat, MataPelajaran>;
    sesi : Map.Map<Nat, Sesi>;
    absensi : Map.Map<Text, Absensi>;
    state : {
      var nextPesertaId : Nat;
      var nextMapelId : Nat;
      var nextSesiId : Nat;
      var ambangPersentase : Float;
    };
    ketuaHalaqah : Map.Map<Principal, [Text]>;
    anggotaPeserta : Map.Map<Principal, Nat>;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      peserta = Map.empty();
      mapel = Map.empty();
      sesi = Map.empty();
      absensi = Map.empty();
      ketuaHalaqah = Map.empty();
      anggotaPeserta = Map.empty();
      state = {
        var nextPesertaId = 0;
        var nextMapelId = 0;
        var nextSesiId = 0;
        var ambangPersentase = 75.0;
      };
    };
  };
};
