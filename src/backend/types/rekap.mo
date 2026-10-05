import Common "common";

module {
  public type RekapPeserta = {
    pesertaId : Common.PesertaId;
    nama : Text;
    kelompokId : Common.KelompokId;
    totalSesi : Nat;
    hadir : Nat;
    persentase : Float;
    diBawahAmbang : Bool;
  };

  public type RekapKelompok = {
    kelompokId : Common.KelompokId;
    nama : Text;
    totalSesi : Nat;
    totalHadir : Nat;
    persentase : Float;
  };

  public type RekapBulanan = {
    bulan : Nat;
    tahun : Nat;
    totalSesi : Nat;
    totalHadir : Nat;
    persentase : Float;
  };

  public type RekapFilter = {
    kelompokId : ?Common.KelompokId;
    bulan : ?Nat;
    tahun : ?Nat;
  };

  public type DashboardRingkasan = {
    kehadiranBulanIni : Float;
    sesiTerdekat : ?SesiRingkas;
    halaqahTerendah : ?RekapKelompok;
  };

  public type SesiRingkas = {
    id : Common.SesiId;
    tanggal : Common.Timestamp;
    kelompokId : Common.KelompokId;
    mapelId : Common.MapelId;
    pemateri : Text;
    media : Common.MediaSesi;
  };

  public type AmbangInput = {
    persentase : Float;
  };

  public func toView(r : RekapPeserta) : RekapPeserta {
    r;
  };
};
