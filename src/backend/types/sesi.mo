import Common "common";

module {
  public type Sesi = {
    id : Common.SesiId;
    tanggal : Common.Timestamp;
    kelompokId : Common.KelompokId;
    mapelId : Common.MapelId;
    pemateri : Text;
    media : Common.MediaSesi;
    tempat : ?Text; // detail tempat/link Zoom/WhatsApp
    jendelaMulai : Common.Timestamp;
    jendelaSelesai : Common.Timestamp;
    checkInToken : ?Text; // token untuk check-in mandiri (link/QR)
  };

  public type SesiInput = {
    tanggal : Common.Timestamp;
    kelompokId : Common.KelompokId;
    mapelId : Common.MapelId;
    pemateri : Text;
    media : Common.MediaSesi;
    tempat : ?Text;
    jendelaMulai : Common.Timestamp;
    jendelaSelesai : Common.Timestamp;
  };

  public type SesiFilter = {
    kelompokId : ?Common.KelompokId;
    mapelId : ?Common.MapelId;
    bulan : ?Nat; // 1..12
    tahun : ?Nat;
  };

  public type DuplikatInput = {
    sesiId : Common.SesiId;
    tanggalTujuan : [Common.Timestamp];
  };

  public type SesiDetail = {
    sesi : Sesi;
    peserta : [PesertaAbsensiView];
  };

  public type PesertaAbsensiView = {
    pesertaId : Common.PesertaId;
    nama : Text;
    status : Common.StatusAbsensi;
    catatan : Text;
  };

  public func toView(s : Sesi) : Sesi {
    s;
  };
};
