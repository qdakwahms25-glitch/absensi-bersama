import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Types "../types/peserta";
import Common "../types/common";

module {
  public func listPeserta(
    peserta : Map.Map<Common.PesertaId, Types.Peserta>,
    filter : Types.PesertaFilter,
  ) : [Types.Peserta] {
    let namaFilter = switch (filter.nama) {
      case (?n) { ?n.toLower() };
      case null { null };
    };
    let hasil = peserta.values().filter(func(p) {
      let cocokNama = switch (namaFilter) {
        case (?n) { p.nama.toLower().contains(#text n) };
        case null { true };
      };
      let cocokKelompok = switch (filter.kelompokId) {
        case (?k) { p.kelompokId == k };
        case null { true };
      };
      cocokNama and cocokKelompok;
    });
    hasil.toArray();
  };

  public func getPeserta(
    peserta : Map.Map<Common.PesertaId, Types.Peserta>,
    id : Common.PesertaId,
  ) : ?Types.Peserta {
    peserta.get(id);
  };

  public func tambahPeserta(
    peserta : Map.Map<Common.PesertaId, Types.Peserta>,
    state : { var nextPesertaId : Nat },
    input : Types.PesertaInput,
  ) : Types.Peserta {
    let id = state.nextPesertaId;
    state.nextPesertaId := id + 1;
    let baru : Types.Peserta = { id; nama = input.nama; kelompokId = input.kelompokId };
    peserta.add(id, baru);
    baru;
  };

  public func ubahPeserta(
    peserta : Map.Map<Common.PesertaId, Types.Peserta>,
    id : Common.PesertaId,
    input : Types.PesertaInput,
  ) : ?Types.Peserta {
    switch (peserta.get(id)) {
      case (?lama) {
        let baru : Types.Peserta = { id; nama = input.nama; kelompokId = input.kelompokId };
        peserta.add(id, baru);
        ?baru;
      };
      case null { null };
    };
  };

  public func hapusPeserta(
    peserta : Map.Map<Common.PesertaId, Types.Peserta>,
    id : Common.PesertaId,
  ) : Bool {
    switch (peserta.get(id)) {
      case (?_) { peserta.remove(id); true };
      case null { false };
    };
  };
};
