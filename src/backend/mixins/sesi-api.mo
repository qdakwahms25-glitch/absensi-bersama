import Map "mo:core/Map";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Types "../types/sesi";
import PesertaTypes "../types/peserta";
import AbsensiTypes "../types/absensi";
import Common "../types/common";
import SesiLib "../lib/sesi";
import AbsensiLib "../lib/absensi";

mixin (
  sesi : Map.Map<Common.SesiId, Types.Sesi>,
  state : { var nextSesiId : Nat },
  peserta : Map.Map<Common.PesertaId, PesertaTypes.Peserta>,
  absensi : Map.Map<Text, AbsensiTypes.Absensi>,
  accessControlState : AccessControl.AccessControlState,
) {
  func pastikanAdminSesi(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Hanya admin yang dapat mengelola sesi");
    };
  };

  public query func listSesi(filter : Types.SesiFilter) : async [Types.Sesi] {
    SesiLib.listSesi(sesi, filter);
  };

  public query func getSesi(id : Common.SesiId) : async ?Types.Sesi {
    SesiLib.getSesi(sesi, id);
  };

  public shared ({ caller }) func buatSesi(input : Types.SesiInput) : async Types.Sesi {
    pastikanAdminSesi(caller);
    SesiLib.buatSesi(sesi, state, input);
  };

  public shared ({ caller }) func ubahSesi(id : Common.SesiId, input : Types.SesiInput) : async ?Types.Sesi {
    pastikanAdminSesi(caller);
    SesiLib.ubahSesi(sesi, id, input);
  };

  public shared ({ caller }) func hapusSesi(id : Common.SesiId) : async Bool {
    pastikanAdminSesi(caller);
    SesiLib.hapusSesi(sesi, id);
  };

  public shared ({ caller }) func duplikatSesi(input : Types.DuplikatInput) : async [Types.Sesi] {
    pastikanAdminSesi(caller);
    SesiLib.duplikatSesi(sesi, state, input);
  };

  public query func detailSesi(id : Common.SesiId) : async ?Types.SesiDetail {
    switch (SesiLib.detailSesi(sesi, id)) {
      case (?s) {
        let daftarPeserta = peserta.values()
          .filter(func(p) { p.kelompokId == s.kelompokId })
          .map(func(p) {
            let (status, catatan) = switch (absensi.get(AbsensiLib.kunci(s.id, p.id))) {
              case (?a) { (a.status, a.catatan) };
              case null { (#hadir, "") };
            };
            { pesertaId = p.id; nama = p.nama; status; catatan };
          })
          .toArray();
        ?{ sesi = s; peserta = daftarPeserta };
      };
      case null { null };
    };
  };
};
