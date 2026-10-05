import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/peserta";
import Common "../types/common";
import PesertaLib "../lib/peserta";

mixin (
  peserta : Map.Map<Common.PesertaId, Types.Peserta>,
  state : { var nextPesertaId : Nat },
  accessControlState : AccessControl.AccessControlState,
) {
  func pastikanAdminPeserta(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Hanya admin yang dapat mengelola data peserta");
    };
  };

  public query func listPeserta(filter : Types.PesertaFilter) : async [Types.Peserta] {
    PesertaLib.listPeserta(peserta, filter);
  };

  public query func getPeserta(id : Common.PesertaId) : async ?Types.Peserta {
    PesertaLib.getPeserta(peserta, id);
  };

  public shared ({ caller }) func tambahPeserta(input : Types.PesertaInput) : async Types.Peserta {
    pastikanAdminPeserta(caller);
    PesertaLib.tambahPeserta(peserta, state, input);
  };

  public shared ({ caller }) func ubahPeserta(id : Common.PesertaId, input : Types.PesertaInput) : async ?Types.Peserta {
    pastikanAdminPeserta(caller);
    PesertaLib.ubahPeserta(peserta, id, input);
  };

  public shared ({ caller }) func hapusPeserta(id : Common.PesertaId) : async Bool {
    pastikanAdminPeserta(caller);
    PesertaLib.hapusPeserta(peserta, id);
  };
};
