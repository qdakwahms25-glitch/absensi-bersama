import Common "common";

module {
  public type MataPelajaran = {
    id : Common.MapelId;
    nama : Text;
  };

  public type MataPelajaranInput = {
    nama : Text;
  };

  public func toView(m : MataPelajaran) : MataPelajaran {
    m;
  };
};
