import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Types "../types/mapel";
import Common "../types/common";

module {
  public func listMapel(
    mapel : Map.Map<Common.MapelId, Types.MataPelajaran>,
  ) : [Types.MataPelajaran] {
    mapel.values().toArray();
  };

  public func tambahMapel(
    mapel : Map.Map<Common.MapelId, Types.MataPelajaran>,
    state : { var nextMapelId : Nat },
    input : Types.MataPelajaranInput,
  ) : Types.MataPelajaran {
    let id = state.nextMapelId;
    state.nextMapelId := id + 1;
    let baru : Types.MataPelajaran = { id; nama = input.nama };
    mapel.add(id, baru);
    baru;
  };

  public func ubahMapel(
    mapel : Map.Map<Common.MapelId, Types.MataPelajaran>,
    id : Common.MapelId,
    input : Types.MataPelajaranInput,
  ) : ?Types.MataPelajaran {
    switch (mapel.get(id)) {
      case (?_) {
        let baru : Types.MataPelajaran = { id; nama = input.nama };
        mapel.add(id, baru);
        ?baru;
      };
      case null { null };
    };
  };

  public func hapusMapel(
    mapel : Map.Map<Common.MapelId, Types.MataPelajaran>,
    id : Common.MapelId,
  ) : Bool {
    switch (mapel.get(id)) {
      case (?_) { mapel.remove(id); true };
      case null { false };
    };
  };
};
