import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

import Common "types/common";
import PesertaTypes "types/peserta";
import MapelTypes "types/mapel";
import SesiTypes "types/sesi";
import AbsensiTypes "types/absensi";

import PesertaApi "mixins/peserta-api";
import MapelApi "mixins/mapel-api";
import SesiApi "mixins/sesi-api";
import AbsensiApi "mixins/absensi-api";
import RekapApi "mixins/rekap-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;

  let peserta : Map.Map<Common.PesertaId, PesertaTypes.Peserta>;
  let mapel : Map.Map<Common.MapelId, MapelTypes.MataPelajaran>;
  let sesi : Map.Map<Common.SesiId, SesiTypes.Sesi>;
  let absensi : Map.Map<Text, AbsensiTypes.Absensi>;
  let state : {
    var nextPesertaId : Nat;
    var nextMapelId : Nat;
    var nextSesiId : Nat;
    var ambangPersentase : Float;
  };

  // Registri yang dikelola admin: principal -> kelompok yang boleh dikelola.
  let ketuaHalaqah : Map.Map<Principal, [Common.KelompokId]>;
  // Registri yang dikelola admin: principal -> peserta miliknya.
  let anggotaPeserta : Map.Map<Principal, Common.PesertaId>;

  include MixinAuthorization(accessControlState, null);
  include PesertaApi(peserta, state, accessControlState);
  include MapelApi(mapel, state, accessControlState);
  include SesiApi(sesi, state, peserta, absensi, accessControlState);
  include AbsensiApi(absensi, sesi, ketuaHalaqah, accessControlState);
  include RekapApi(peserta, sesi, absensi, state, ketuaHalaqah, anggotaPeserta, accessControlState);
  include ApiDocMixin();

  include Expose({
    entities = [
      peserta.toEntity("peserta", "Peserta", "id")
        .sample({ id = 0; nama = ""; kelompokId = "" })
        .controllerOnly()
        .build(),
      mapel.toEntity("mapel", "MataPelajaran", "id")
        .sample({ id = 0; nama = "" })
        .controllerOnly()
        .build(),
      OQL.Entity.manual<SesiTypes.Sesi>("sesi", func() = sesi.values(), "Sesi", "id")
        .sample({
          id = 0;
          tanggal = 0;
          kelompokId = "";
          mapelId = 0;
          pemateri = "";
          media = #tatapMuka;
          tempat = null;
          jendelaMulai = 0;
          jendelaSelesai = 0;
          checkInToken = null;
        })
        .payload("id", func s = s.id)
        .payload("tanggal", func s = s.tanggal)
        .payload("kelompokId", func s = s.kelompokId)
        .payload("mapelId", func s = s.mapelId)
        .payload("pemateri", func s = s.pemateri)
        .payload("media", func s = Common.mediaToText(s.media))
        .payload("tempat", func s = switch (s.tempat) { case (?t) t; case null "" })
        .payload("jendelaMulai", func s = s.jendelaMulai)
        .payload("jendelaSelesai", func s = s.jendelaSelesai)
        .controllerOnly()
        .build(),
      OQL.Entity.manual<AbsensiTypes.Absensi>("absensi", func() = absensi.values(), "Absensi", "kunci")
        .sample({
          sesiId = 0;
          pesertaId = 0;
          status = #hadir;
          catatan = "";
          dicatatOleh = null;
          waktuCatat = 0;
        })
        .payload("kunci", func a = a.sesiId.toText() # ":" # a.pesertaId.toText())
        .payload("sesiId", func a = a.sesiId)
        .payload("pesertaId", func a = a.pesertaId)
        .payload("status", func a = Common.statusToText(a.status))
        .payload("catatan", func a = a.catatan)
        .payload("waktuCatat", func a = a.waktuCatat)
        .controllerOnly()
        .build(),
    ];
  });
};
