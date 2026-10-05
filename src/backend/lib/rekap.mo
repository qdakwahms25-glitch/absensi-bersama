import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Float "mo:core/Float";
import Types "../types/rekap";
import PesertaTypes "../types/peserta";
import SesiTypes "../types/sesi";
import AbsensiTypes "../types/absensi";
import Common "../types/common";
import SesiLib "sesi";
import AbsensiLib "absensi";

module {
  // Kelompok tetap: Asatidz & Karyawan (Halaqah 1-6) dan Musyrifah.
  public let kelompokTetap : [Common.Kelompok] = [
    { id = "asatidz-h1"; nama = "Halaqah 1"; halaqah = ?1 },
    { id = "asatidz-h2"; nama = "Halaqah 2"; halaqah = ?2 },
    { id = "asatidz-h3"; nama = "Halaqah 3"; halaqah = ?3 },
    { id = "asatidz-h4"; nama = "Halaqah 4"; halaqah = ?4 },
    { id = "asatidz-h5"; nama = "Halaqah 5"; halaqah = ?5 },
    { id = "asatidz-h6"; nama = "Halaqah 6"; halaqah = ?6 },
    { id = "musyrifah"; nama = "Musyrifah"; halaqah = null },
  ];

  public func namaKelompok(id : Common.KelompokId) : Text {
    switch (kelompokTetap.find(func(k) { k.id == id })) {
      case (?k) { k.nama };
      case null { id };
    };
  };

  func cocokFilterSesi(s : SesiTypes.Sesi, filter : Types.RekapFilter) : Bool {
    let cocokKelompok = switch (filter.kelompokId) {
      case (?k) { s.kelompokId == k };
      case null { true };
    };
    let (tahun, bulan) = SesiLib.tanggalParts(s.tanggal);
    let cocokBulan = switch (filter.bulan) {
      case (?b) { bulan == b };
      case null { true };
    };
    let cocokTahun = switch (filter.tahun) {
      case (?t) { tahun == t };
      case null { true };
    };
    cocokKelompok and cocokBulan and cocokTahun;
  };

  func persen(hadir : Nat, total : Nat) : Float {
    if (total == 0) { 0.0 } else { hadir.toFloat() / total.toFloat() * 100.0 };
  };

  public func rekapPerPeserta(
    peserta : Map.Map<Common.PesertaId, PesertaTypes.Peserta>,
    sesi : Map.Map<Common.SesiId, SesiTypes.Sesi>,
    absensi : Map.Map<Text, AbsensiTypes.Absensi>,
    filter : Types.RekapFilter,
    ambang : Float,
  ) : [Types.RekapPeserta] {
    let sesiTerpilih = sesi.values().filter(func(s) { cocokFilterSesi(s, filter) }).toArray();
    let hasil = peserta.values().map(func(p) {
      var hadir = 0;
      var total = 0;
      for (s in sesiTerpilih.values()) {
        if (s.kelompokId == p.kelompokId) {
          total += 1;
          switch (absensi.get(AbsensiLib.kunci(s.id, p.id))) {
            case (?a) {
              if (a.status == #hadir) { hadir += 1 };
            };
            case null {};
          };
        };
      };
      let pct = persen(hadir, total);
      {
        pesertaId = p.id;
        nama = p.nama;
        kelompokId = p.kelompokId;
        totalSesi = total;
        hadir;
        persentase = pct;
        diBawahAmbang = pct < ambang;
      };
    });
    hasil.toArray();
  };

  public func rekapPerKelompok(
    peserta : Map.Map<Common.PesertaId, PesertaTypes.Peserta>,
    sesi : Map.Map<Common.SesiId, SesiTypes.Sesi>,
    absensi : Map.Map<Text, AbsensiTypes.Absensi>,
    filter : Types.RekapFilter,
  ) : [Types.RekapKelompok] {
    let sesiTerpilih = sesi.values().filter(func(s) { cocokFilterSesi(s, filter) }).toArray();
    let hasil = kelompokTetap.map(func(k) {
      var totalSesi = 0;
      var totalHadir = 0;
      for (s in sesiTerpilih.values()) {
        if (s.kelompokId == k.id) {
          totalSesi += 1;
          for (a in absensi.values()) {
            if (a.sesiId == s.id and a.status == #hadir) {
              totalHadir += 1;
            };
          };
        };
      };
      {
        kelompokId = k.id;
        nama = k.nama;
        totalSesi;
        totalHadir;
        persentase = persen(totalHadir, totalSesi);
      };
    });
    hasil;
  };

  public func rekapBulanan(
    sesi : Map.Map<Common.SesiId, SesiTypes.Sesi>,
    absensi : Map.Map<Text, AbsensiTypes.Absensi>,
    bulan : Nat,
    tahun : Nat,
  ) : Types.RekapBulanan {
    var totalSesi = 0;
    var totalHadir = 0;
    for (s in sesi.values()) {
      let (t, b) = SesiLib.tanggalParts(s.tanggal);
      if (t == tahun and b == bulan) {
        totalSesi += 1;
        for (a in absensi.values()) {
          if (a.sesiId == s.id and a.status == #hadir) {
            totalHadir += 1;
          };
        };
      };
    };
    { bulan; tahun; totalSesi; totalHadir; persentase = persen(totalHadir, totalSesi) };
  };

  public func dashboard(
    peserta : Map.Map<Common.PesertaId, PesertaTypes.Peserta>,
    sesi : Map.Map<Common.SesiId, SesiTypes.Sesi>,
    absensi : Map.Map<Text, AbsensiTypes.Absensi>,
    sekarang : Common.Timestamp,
  ) : Types.DashboardRingkasan {
    let (tahun, bulan) = SesiLib.tanggalParts(sekarang);
    let bulanan = rekapBulanan(sesi, absensi, bulan, tahun);

    // Sesi terdekat: tanggal >= sekarang, paling awal.
    var terdekat : ?SesiTypes.Sesi = null;
    for (s in sesi.values()) {
      if (s.tanggal >= sekarang) {
        switch (terdekat) {
          case (?cur) { if (s.tanggal < cur.tanggal) { terdekat := ?s } };
          case null { terdekat := ?s };
        };
      };
    };
    let sesiTerdekat = switch (terdekat) {
      case (?s) {
        ?{
          id = s.id;
          tanggal = s.tanggal;
          kelompokId = s.kelompokId;
          mapelId = s.mapelId;
          pemateri = s.pemateri;
          media = s.media;
        };
      };
      case null { null };
    };

    // Halaqah dengan kehadiran terendah (hanya yang punya sesi).
    let rekapKel = rekapPerKelompok(peserta, sesi, absensi, { kelompokId = null; bulan = null; tahun = null });
    var terendah : ?Types.RekapKelompok = null;
    for (r in rekapKel.values()) {
      if (r.totalSesi > 0) {
        switch (terendah) {
          case (?cur) { if (r.persentase < cur.persentase) { terendah := ?r } };
          case null { terendah := ?r };
        };
      };
    };

    {
      kehadiranBulanIni = bulanan.persentase;
      sesiTerdekat;
      halaqahTerendah = terendah;
    };
  };

  public func setAmbang(
    state : { var ambangPersentase : Float },
    input : Types.AmbangInput,
  ) : Float {
    state.ambangPersentase := input.persentase;
    state.ambangPersentase;
  };

  public func getAmbang(
    state : { var ambangPersentase : Float },
  ) : Float {
    state.ambangPersentase;
  };
};
