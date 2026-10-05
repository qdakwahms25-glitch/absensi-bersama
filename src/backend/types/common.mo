module {
  // Identifiers
  public type PesertaId = Nat;
  public type MapelId = Nat;
  public type SesiId = Nat;
  public type KelompokId = Text;

  // Timestamp in nanoseconds (Time.now())
  public type Timestamp = Int;

  // Kelompok tetap: Asatidz & Karyawan (Halaqah 1-6) dan Musyrifah
  public type Kelompok = {
    id : KelompokId;
    nama : Text;
    halaqah : ?Nat; // 1..6 untuk Asatidz & Karyawan; null untuk Musyrifah
  };

  // Media/tempat sesi
  public type MediaSesi = {
    #tatapMuka;
    #zoom;
    #whatsapp;
  };

  // Status absensi per peserta
  public type StatusAbsensi = {
    #hadir;
    #izin;
    #sakit;
    #alpa;
  };

  // Peran aplikasi (selaras dengan UserRole authorization)
  public type PeranApp = {
    #admin;
    #ketuaHalaqah;
    #anggota;
  };

  public func mediaToText(m : MediaSesi) : Text {
    switch m {
      case (#tatapMuka) { "Tatap Muka" };
      case (#zoom) { "Zoom" };
      case (#whatsapp) { "WhatsApp" };
    };
  };

  public func statusToText(s : StatusAbsensi) : Text {
    switch s {
      case (#hadir) { "Hadir" };
      case (#izin) { "Izin" };
      case (#sakit) { "Sakit" };
      case (#alpa) { "Alpa" };
    };
  };
};
