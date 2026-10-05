import Common "common";

module {
  public type Absensi = {
    sesiId : Common.SesiId;
    pesertaId : Common.PesertaId;
    status : Common.StatusAbsensi;
    catatan : Text;
    dicatatOleh : ?Principal;
    waktuCatat : Common.Timestamp;
  };

  public type AbsensiInput = {
    pesertaId : Common.PesertaId;
    status : Common.StatusAbsensi;
    catatan : Text;
  };

  public type SimpanAbsensiInput = {
    sesiId : Common.SesiId;
    daftar : [AbsensiInput];
  };

  public type RingkasanStatus = {
    hadir : Nat;
    izin : Nat;
    sakit : Nat;
    alpa : Nat;
    total : Nat;
  };

  public type CheckInInput = {
    token : Text;
    pesertaId : Common.PesertaId;
  };

  public func toView(a : Absensi) : Absensi {
    a;
  };
};
