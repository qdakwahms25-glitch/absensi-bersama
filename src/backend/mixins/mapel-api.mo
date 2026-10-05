import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/mapel";
import Common "../types/common";
import MapelLib "../lib/mapel";

mixin (
  mapel : Map.Map<Common.MapelId, Types.MataPelajaran>,
  state : { var nextMapelId : Nat },
  accessControlState : AccessControl.AccessControlState,
) {
  func pastikanAdminMapel(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Hanya admin yang dapat mengelola mata pelajaran");
    };
  };

  public query func listMapel() : async [Types.MataPelajaran] {
    MapelLib.listMapel(mapel);
  };

  public shared ({ caller }) func tambahMapel(input : Types.MataPelajaranInput) : async Types.MataPelajaran {
    pastikanAdminMapel(caller);
    MapelLib.tambahMapel(mapel, state, input);
  };

  public shared ({ caller }) func ubahMapel(id : Common.MapelId, input : Types.MataPelajaranInput) : async ?Types.MataPelajaran {
    pastikanAdminMapel(caller);
    MapelLib.ubahMapel(mapel, id, input);
  };

  public shared ({ caller }) func hapusMapel(id : Common.MapelId) : async Bool {
    pastikanAdminMapel(caller);
    MapelLib.hapusMapel(mapel, id);
  };
};
