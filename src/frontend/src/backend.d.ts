import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Absensi {
    status: StatusAbsensi;
    dicatatOleh?: Principal;
    sesiId: SesiId;
    waktuCatat: Timestamp;
    pesertaId: PesertaId;
    catatan: string;
}
export interface AbsensiInput {
    status: StatusAbsensi;
    pesertaId: PesertaId;
    catatan: string;
}
export interface AmbangInput {
    persentase: number;
}
export interface Cell {
    value: Value;
    name: string;
}
export interface CheckInInput {
    token: string;
    pesertaId: PesertaId;
}
export interface DashboardRingkasan {
    halaqahTerendah?: RekapKelompok;
    kehadiranBulanIni: number;
    sesiTerdekat?: SesiRingkas;
}
export interface DuplikatInput {
    sesiId: SesiId;
    tanggalTujuan: Array<Timestamp>;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export type KelompokId = string;
export type MapelId = bigint;
export interface MataPelajaran {
    id: MapelId;
    nama: string;
}
export interface MataPelajaranInput {
    nama: string;
}
export interface Peserta {
    id: PesertaId;
    kelompokId: KelompokId;
    nama: string;
}
export interface PesertaAbsensiView {
    status: StatusAbsensi;
    nama: string;
    pesertaId: PesertaId;
    catatan: string;
}
export interface PesertaFilter {
    kelompokId?: KelompokId;
    nama?: string;
}
export type PesertaId = bigint;
export interface PesertaInput {
    kelompokId: KelompokId;
    nama: string;
}
export interface RekapBulanan {
    tahun: bigint;
    totalHadir: bigint;
    totalSesi: bigint;
    persentase: number;
    bulan: bigint;
}
export interface RekapFilter {
    tahun?: bigint;
    kelompokId?: KelompokId;
    bulan?: bigint;
}
export interface RekapKelompok {
    kelompokId: KelompokId;
    totalHadir: bigint;
    nama: string;
    totalSesi: bigint;
    persentase: number;
}
export interface RekapPeserta {
    kelompokId: KelompokId;
    hadir: bigint;
    nama: string;
    totalSesi: bigint;
    persentase: number;
    pesertaId: PesertaId;
    diBawahAmbang: boolean;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface RingkasanStatus {
    total: bigint;
    hadir: bigint;
    alpa: bigint;
    izin: bigint;
    sakit: bigint;
}
export interface Sesi {
    id: SesiId;
    media: MediaSesi;
    kelompokId: KelompokId;
    pemateri: string;
    tanggal: Timestamp;
    mapelId: MapelId;
    jendelaSelesai: Timestamp;
    checkInToken?: string;
    jendelaMulai: Timestamp;
    tempat?: string;
}
export interface SesiDetail {
    peserta: Array<PesertaAbsensiView>;
    sesi: Sesi;
}
export interface SesiFilter {
    tahun?: bigint;
    kelompokId?: KelompokId;
    mapelId?: MapelId;
    bulan?: bigint;
}
export type SesiId = bigint;
export interface SesiInput {
    media: MediaSesi;
    kelompokId: KelompokId;
    pemateri: string;
    tanggal: Timestamp;
    mapelId: MapelId;
    jendelaSelesai: Timestamp;
    jendelaMulai: Timestamp;
    tempat?: string;
}
export interface SesiRingkas {
    id: SesiId;
    media: MediaSesi;
    kelompokId: KelompokId;
    pemateri: string;
    tanggal: Timestamp;
    mapelId: MapelId;
}
export interface SimpanAbsensiInput {
    daftar: Array<AbsensiInput>;
    sesiId: SesiId;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum MediaSesi {
    zoom = "zoom",
    whatsapp = "whatsapp",
    tatapMuka = "tatapMuka"
}
export enum StatusAbsensi {
    hadir = "hadir",
    alpa = "alpa",
    izin = "izin",
    sakit = "sakit"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    buatSesi(input: SesiInput): Promise<Sesi>;
    checkIn(input: CheckInInput): Promise<Absensi>;
    daftarkanAnggota(principal: Principal, pesertaId: PesertaId): Promise<void>;
    daftarkanKetuaHalaqah(principal: Principal, kelompokId: KelompokId): Promise<void>;
    dashboard(): Promise<DashboardRingkasan>;
    detailSesi(id: SesiId): Promise<SesiDetail | null>;
    duplikatSesi(input: DuplikatInput): Promise<Array<Sesi>>;
    eksporRekapExcel(filter: RekapFilter): Promise<Uint8Array>;
    eksporRekapPdf(filter: RekapFilter): Promise<Uint8Array>;
    execute(qJson: string): Promise<Result>;
    getAbsensiSesi(sesiId: SesiId): Promise<Array<Absensi>>;
    getAmbang(): Promise<number>;
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    getKelompokSaya(): Promise<Array<KelompokId>>;
    getPeserta(id: PesertaId): Promise<Peserta | null>;
    getPesertaSaya(): Promise<PesertaId | null>;
    getSesi(id: SesiId): Promise<Sesi | null>;
    hapusAnggota(principal: Principal): Promise<void>;
    hapusKetuaHalaqah(principal: Principal): Promise<void>;
    hapusMapel(id: MapelId): Promise<boolean>;
    hapusPeserta(id: PesertaId): Promise<boolean>;
    hapusSesi(id: SesiId): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listMapel(): Promise<Array<MataPelajaran>>;
    listPeserta(filter: PesertaFilter): Promise<Array<Peserta>>;
    listSesi(filter: SesiFilter): Promise<Array<Sesi>>;
    rekapBulanan(bulan: bigint, tahun: bigint): Promise<RekapBulanan>;
    rekapPerKelompok(filter: RekapFilter): Promise<Array<RekapKelompok>>;
    rekapPerPeserta(filter: RekapFilter): Promise<Array<RekapPeserta>>;
    ringkasanSesi(sesiId: SesiId): Promise<RingkasanStatus>;
    schema(): Promise<string>;
    setAmbang(input: AmbangInput): Promise<number>;
    simpanAbsensi(input: SimpanAbsensiInput): Promise<RingkasanStatus>;
    tambahMapel(input: MataPelajaranInput): Promise<MataPelajaran>;
    tambahPeserta(input: PesertaInput): Promise<Peserta>;
    ubahMapel(id: MapelId, input: MataPelajaranInput): Promise<MataPelajaran | null>;
    ubahPeserta(id: PesertaId, input: PesertaInput): Promise<Peserta | null>;
    ubahSesi(id: SesiId, input: SesiInput): Promise<Sesi | null>;
}
