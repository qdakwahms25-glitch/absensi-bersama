import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Blob "mo:core/Blob";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/rekap";
import PesertaTypes "../types/peserta";
import SesiTypes "../types/sesi";
import AbsensiTypes "../types/absensi";
import Common "../types/common";
import RekapLib "../lib/rekap";

mixin (
  peserta : Map.Map<Common.PesertaId, PesertaTypes.Peserta>,
  sesi : Map.Map<Common.SesiId, SesiTypes.Sesi>,
  absensi : Map.Map<Text, AbsensiTypes.Absensi>,
  state : { var ambangPersentase : Float },
  ketuaHalaqah : Map.Map<Principal, [Common.KelompokId]>,
  anggotaPeserta : Map.Map<Principal, Common.PesertaId>,
  accessControlState : AccessControl.AccessControlState,
) {
  func pastikanAdminRekap(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Hanya admin yang dapat mengubah ambang batas");
    };
  };

  func pastikanAdminLaporan(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Hanya admin yang dapat melihat rekap ini");
    };
  };

  // Terapkan pembatasan akses yang sama seperti rekapPerPeserta:
  // admin melihat semua, anggota hanya barisnya sendiri, ketua halaqah
  // hanya baris kelompoknya, selain itu kosong.
  func rekapTerbatas(caller : Principal, filter : Types.RekapFilter) : [Types.RekapPeserta] {
    let semua = RekapLib.rekapPerPeserta(peserta, sesi, absensi, filter, state.ambangPersentase);
    if (AccessControl.isAdmin(accessControlState, caller)) { return semua };
    switch (anggotaPeserta.get(caller)) {
      case (?pid) { semua.filter(func(r) { r.pesertaId == pid }) };
      case null {
        switch (ketuaHalaqah.get(caller)) {
          case (?daftar) { semua.filter(func(r) { daftar.contains(r.kelompokId) }) };
          case null { [] };
        };
      };
    };
  };

  public query ({ caller }) func rekapPerPeserta(filter : Types.RekapFilter) : async [Types.RekapPeserta] {
    rekapTerbatas(caller, filter);
  };

  public query ({ caller }) func rekapPerKelompok(filter : Types.RekapFilter) : async [Types.RekapKelompok] {
    pastikanAdminLaporan(caller);
    RekapLib.rekapPerKelompok(peserta, sesi, absensi, filter);
  };

  public query ({ caller }) func rekapBulanan(bulan : Nat, tahun : Nat) : async Types.RekapBulanan {
    pastikanAdminLaporan(caller);
    RekapLib.rekapBulanan(sesi, absensi, bulan, tahun);
  };

  public query func dashboard() : async Types.DashboardRingkasan {
    RekapLib.dashboard(peserta, sesi, absensi, Time.now());
  };

  public shared ({ caller }) func setAmbang(input : Types.AmbangInput) : async Float {
    pastikanAdminRekap(caller);
    RekapLib.setAmbang(state, input);
  };

  public query func getAmbang() : async Float {
    RekapLib.getAmbang(state);
  };

  // --- Registri anggota (dikelola admin) ---

  public shared ({ caller }) func daftarkanAnggota(principal : Principal, pesertaId : Common.PesertaId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Hanya admin yang dapat mendaftarkan anggota");
    };
    anggotaPeserta.add(principal, pesertaId);
  };

  public shared ({ caller }) func hapusAnggota(principal : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Hanya admin yang dapat menghapus anggota");
    };
    anggotaPeserta.remove(principal);
  };

  public query ({ caller }) func getPesertaSaya() : async ?Common.PesertaId {
    anggotaPeserta.get(caller);
  };

  // --- Ekspor ---

  public query ({ caller }) func eksporRekapPdf(filter : Types.RekapFilter) : async Blob {
    let baris = rekapTerbatas(caller, filter);
    let teks = baris.map(func(r) {
      r.nama # " (" # RekapLib.namaKelompok(r.kelompokId) # "): "
        # r.hadir.toText() # "/" # r.totalSesi.toText() # " = "
        # r.persentase.toText() # "%"
        # (if (r.diBawahAmbang) { " [di bawah ambang]" } else { "" })
    });
    pdfBuild("Rekap Kehadiran Peserta", teks);
  };

  public query ({ caller }) func eksporRekapExcel(filter : Types.RekapFilter) : async Blob {
    let baris = rekapTerbatas(caller, filter);
    let header = "Nama;Kelompok;Total Sesi;Hadir;Persentase;Di Bawah Ambang";
    let isi = baris.map(func(r) {
      r.nama # ";" # RekapLib.namaKelompok(r.kelompokId) # ";"
        # r.totalSesi.toText() # ";" # r.hadir.toText() # ";"
        # r.persentase.toText() # ";" # (if (r.diBawahAmbang) { "Ya" } else { "Tidak" })
    });
    let semua = [header].concat(isi);
    semua.values().join("\n").encodeUtf8();
  };

  // --- Pembuat PDF minimal (PDF 1.4, satu halaman, font Helvetica) ---

  func pdfAppendText(buf : List.List<Nat8>, t : Text) {
    for (b in t.encodeUtf8().values()) { buf.add(b) };
  };

  // Menulis teks ke dalam string PDF: escape \ ( ) dan ganti byte non-ASCII.
  func pdfAppendEscaped(buf : List.List<Nat8>, t : Text) {
    let backslash : Nat8 = 0x5C;
    let openParen : Nat8 = 0x28;
    let closeParen : Nat8 = 0x29;
    let question : Nat8 = 0x3F;
    for (b in t.encodeUtf8().values()) {
      if (b == backslash) { buf.add(backslash); buf.add(backslash) }
      else if (b == openParen) { buf.add(backslash); buf.add(openParen) }
      else if (b == closeParen) { buf.add(backslash); buf.add(closeParen) }
      else if (b > 126) { buf.add(question) }
      else { buf.add(b) };
    };
  };

  func pdfOffset(n : Nat) : Text {
    let s = n.toText();
    var pad = "";
    var i = s.size();
    while (i < 10) { pad #= "0"; i += 1 };
    pad # s;
  };

  func pdfBuild(judul : Text, baris : [Text]) : Blob {
    let buf = List.empty<Nat8>();

    // Content stream.
    let content = List.empty<Nat8>();
    pdfAppendText(content, "BT\n/F1 10 Tf\n40 800 Td\n14 TL\n");
    pdfAppendEscaped(content, judul);
    pdfAppendText(content, " Tj\nT*\n");
    for (b in baris.values()) {
      pdfAppendEscaped(content, b);
      pdfAppendText(content, " Tj\nT*\n");
    };
    pdfAppendText(content, "ET\n");
    let contentBytes = content.toArray();

    pdfAppendText(buf, "%PDF-1.4\n");

    let off1 = buf.size();
    pdfAppendText(buf, "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    let off2 = buf.size();
    pdfAppendText(buf, "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
    let off3 = buf.size();
    pdfAppendText(buf, "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n");
    let off4 = buf.size();
    pdfAppendText(buf, "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
    let off5 = buf.size();
    pdfAppendText(buf, "5 0 obj\n<< /Length " # contentBytes.size().toText() # " >>\nstream\n");
    for (b in contentBytes.values()) { buf.add(b) };
    pdfAppendText(buf, "\nendstream\nendobj\n");

    let xrefOff = buf.size();
    pdfAppendText(buf, "xref\n0 6\n0000000000 65535 f \n");
    pdfAppendText(buf, pdfOffset(off1) # " 00000 n \n");
    pdfAppendText(buf, pdfOffset(off2) # " 00000 n \n");
    pdfAppendText(buf, pdfOffset(off3) # " 00000 n \n");
    pdfAppendText(buf, pdfOffset(off4) # " 00000 n \n");
    pdfAppendText(buf, pdfOffset(off5) # " 00000 n \n");
    pdfAppendText(buf, "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n" # xrefOff.toText() # "\n%%EOF\n");

    buf.toArray().toBlob();
  };
};
