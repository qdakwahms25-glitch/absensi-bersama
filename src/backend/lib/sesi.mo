import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Types "../types/sesi";
import Common "../types/common";

module {
  // Nanoseconds per day / month approximations are not used; we derive calendar
  // month/year from the epoch-day count using a civil-from-days algorithm.
  let nsPerDay : Int = 86_400_000_000_000;

  // Returns (year, month 1..12) for a timestamp in nanoseconds since epoch.
  public func tanggalParts(ts : Common.Timestamp) : (Nat, Nat) {
    var days = ts / nsPerDay;
    if (ts < 0 and ts % nsPerDay != 0) { days -= 1 };
    // civil_from_days (Howard Hinnant), days relative to 1970-01-01
    let z = days + 719_468;
    let era = (if (z >= 0) { z } else { z - 146_096 }) / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36_524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if (mp < 10) { mp + 3 } else { mp - 9 };
    let year = if (m <= 2) { y + 1 } else { y };
    ignore d;
    (year.toNat(), m.toNat());
  };

  func cocokFilter(s : Types.Sesi, filter : Types.SesiFilter) : Bool {
    let cocokKelompok = switch (filter.kelompokId) {
      case (?k) { s.kelompokId == k };
      case null { true };
    };
    let cocokMapel = switch (filter.mapelId) {
      case (?m) { s.mapelId == m };
      case null { true };
    };
    let (tahun, bulan) = tanggalParts(s.tanggal);
    let cocokBulan = switch (filter.bulan) {
      case (?b) { bulan == b };
      case null { true };
    };
    let cocokTahun = switch (filter.tahun) {
      case (?t) { tahun == t };
      case null { true };
    };
    cocokKelompok and cocokMapel and cocokBulan and cocokTahun;
  };

  public func listSesi(
    sesi : Map.Map<Common.SesiId, Types.Sesi>,
    filter : Types.SesiFilter,
  ) : [Types.Sesi] {
    let hasil = sesi.values().filter(func(s) { cocokFilter(s, filter) });
    hasil.toArray().sort(func(a, b) = Int.compare(a.tanggal, b.tanggal));
  };

  public func getSesi(
    sesi : Map.Map<Common.SesiId, Types.Sesi>,
    id : Common.SesiId,
  ) : ?Types.Sesi {
    sesi.get(id);
  };

  // Token check-in unik per sesi, dipakai untuk link/QR absen mandiri.
  func buatToken(id : Common.SesiId) : Text {
    "sesi-" # id.toText() # "-" # Time.now().toText();
  };

  func buatDariInput(id : Common.SesiId, input : Types.SesiInput, token : Text) : Types.Sesi {
    {
      id;
      tanggal = input.tanggal;
      kelompokId = input.kelompokId;
      mapelId = input.mapelId;
      pemateri = input.pemateri;
      media = input.media;
      tempat = input.tempat;
      jendelaMulai = input.jendelaMulai;
      jendelaSelesai = input.jendelaSelesai;
      checkInToken = ?token;
    };
  };

  public func buatSesi(
    sesi : Map.Map<Common.SesiId, Types.Sesi>,
    state : { var nextSesiId : Nat },
    input : Types.SesiInput,
  ) : Types.Sesi {
    let id = state.nextSesiId;
    state.nextSesiId := id + 1;
    let baru = buatDariInput(id, input, buatToken(id));
    sesi.add(id, baru);
    baru;
  };

  public func ubahSesi(
    sesi : Map.Map<Common.SesiId, Types.Sesi>,
    id : Common.SesiId,
    input : Types.SesiInput,
  ) : ?Types.Sesi {
    switch (sesi.get(id)) {
      case (?lama) {
        let baru : Types.Sesi = {
          id;
          tanggal = input.tanggal;
          kelompokId = input.kelompokId;
          mapelId = input.mapelId;
          pemateri = input.pemateri;
          media = input.media;
          tempat = input.tempat;
          jendelaMulai = input.jendelaMulai;
          jendelaSelesai = input.jendelaSelesai;
          checkInToken = lama.checkInToken;
        };
        sesi.add(id, baru);
        ?baru;
      };
      case null { null };
    };
  };

  public func hapusSesi(
    sesi : Map.Map<Common.SesiId, Types.Sesi>,
    id : Common.SesiId,
  ) : Bool {
    switch (sesi.get(id)) {
      case (?_) { sesi.remove(id); true };
      case null { false };
    };
  };

  public func duplikatSesi(
    sesi : Map.Map<Common.SesiId, Types.Sesi>,
    state : { var nextSesiId : Nat },
    input : Types.DuplikatInput,
  ) : [Types.Sesi] {
    switch (sesi.get(input.sesiId)) {
      case (?sumber) {
        let hasil = input.tanggalTujuan.map(func(t) {
          let id = state.nextSesiId;
          state.nextSesiId := id + 1;
          let baru : Types.Sesi = {
            id;
            tanggal = t;
            kelompokId = sumber.kelompokId;
            mapelId = sumber.mapelId;
            pemateri = sumber.pemateri;
            media = sumber.media;
            tempat = sumber.tempat;
            jendelaMulai = sumber.jendelaMulai;
            jendelaSelesai = sumber.jendelaSelesai;
            checkInToken = ?buatToken(id);
          };
          sesi.add(id, baru);
          baru;
        });
        hasil;
      };
      case null { [] };
    };
  };

  public func detailSesi(
    sesi : Map.Map<Common.SesiId, Types.Sesi>,
    id : Common.SesiId,
  ) : ?Types.Sesi {
    sesi.get(id);
  };
};
