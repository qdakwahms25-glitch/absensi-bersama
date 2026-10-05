import Common "common";

module {
  // Peserta hanya menyimpan nama dan kelompok (tanpa data pribadi lain)
  public type Peserta = {
    id : Common.PesertaId;
    nama : Text;
    kelompokId : Common.KelompokId;
  };

  public type PesertaInput = {
    nama : Text;
    kelompokId : Common.KelompokId;
  };

  public type PesertaFilter = {
    nama : ?Text;
    kelompokId : ?Common.KelompokId;
  };

  public func toView(p : Peserta) : Peserta {
    p;
  };
};
