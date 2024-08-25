export interface Engins {
    id: string,
    designation: string,
    code_parc: string,
    immatriculation: string,
    utilisateur_id: string,
    classe_id: string
}

export interface classe_engins {
    id: string,
    designation: string,
    taches:string[]
}


export interface Pannes {
    id: string,
    engin_id: string,
    debut_panne: string,
    fin_panne: string,
    heure_debut: string,
    heure_fin: string
    motif_panne: string,
    situation: string
}

export interface Gasoil {
    id: string,
    id_engin: string,
    compteur: string,
    quantite_go: string,
    date: string,
    diff_work: string,
    numero: string
}

export interface appro_gasoil {
    id: string,
    date: string,
    quantite: number,
    reception: string
}


export interface conso {
    id: string,
    date: string,
    conso: number
}
export interface tab_personnel {
    id: string,
    nom: string,
    prenom: string,
    fonction: string,
    num_phone1: string,
    num_phone2: string,
    email: string,
    num_matricule: string,
    dates: string[],
    heuresN: number[],
    heureSup: number[],
    Presence: boolean[],
    statut_id: string
}


export interface valueXY {
    x: string,
    y: number
}
export interface sous_traitant {
    id: string,
    entreprise: string,
    enseigne: string,
    ifu: string,
    rccm: string,
    adresse: string,
    phone: string,
    nom_responsable: string,
    prenom_responsable: string,
    date_naissance: string,
    lieu_naissance: string,
    num_cnib: string
}
export interface Entreprise {
    id: string,
    entreprise: string,
    enseigne: string,
    ifu: string,
    rccm: string,
    adresse: string,
    phone: string,
    nom_responsable: string,
    prenom_responsable: string,
    date_naissance: string,
    lieu_naissance: string,
    num_cnib: string
}
export interface Projet {
    id: string,
    code: string,
    intitule: string,
    descrip_travaux: string,
    maitre_ouvrage: string,
    maitre_oeuvre: string,
    financement: string
}
export interface Devis {
    id: string,
    code: string,
    client_id: string,
    entreprise_id: string,
    projet_id: string,
    objet: string,
    reference: string,
    montant: number,
    avance: number
}
export interface Ligne_devis {
    id: string,
    code: string,
    devis_id: string,
    parent_code: string,
    designation: string,
    prix_u: number,
    unite: string,
    quantite: number,
    montant: number,
    collapsed: boolean,
    isvisible: boolean
    poste: string,
}


export interface Contrats {
    id: string,
    projet_id: string,
    sous_traitant_id: string,
    montant: number,
    duree_travaux: string,
    montant_avance: number,
}


export interface pointage {
    id: string,
    personnel_id: string,
    date: string,
    presence: {
        is_present: boolean,
        nbre_heure: number
    },
    heure_sup: number
}

export interface gasoilStore {
    conso_data: Gasoil[],
    err: string | null,
    selectedDate: string[],
    message: string,
    date_jour: string,
    selectedEngin:string,
    selectedClass:string,
}

export interface Tab_personnelStore {
    personnel_data: tab_personnel[],
    err: string | null,
    selectedId: string,
    selectedNom_prenom: string,
    message: string,
    current_date: string,
    click: number[]
}

export interface PointageStore {
    pointage_data: pointage[],
    err: string | null,
    message: string
}

export interface ApprogoStore {
    approgo_data: appro_gasoil[],
    err: string | null
}
export interface Tab_classeEnginsStore {
    classes: classe_engins[],
    message: string,
    selectedId: string
}
export interface Tab_EnginsStore {
    engins: Engins[],
    message: string,
    selectedId: string,
    selectedIds: string[],
    selectedClasseId: string,
    selectedDesignation: string
}
export interface tab_ProjetStore {
    projets_data: Projet[],
    err: string | null,
    selectedId: string,
    message: string
}
export interface tab_SoustraitantStore {
    sstraitant_data: sous_traitant[],
    err: string | null,
    selectedId: string,
    message: string,
}

export interface tab_PannesStore {
    pannes_data: Pannes[],
    err: string | null,
    selectedId: string,
    message: string,
    intervalleDate: string[],
    EnginsIds: string[]
}
export interface tab_ressources {
    id: string,
    designation: string,
    unite: string,
    prix_unitaire: number,
    categorie_id: string,
    code: string
}
export interface tab_familles {
    id: string,
    designation: string,
    description: string
}
export interface tab_categories {
    id: string,
    famille_id: string,
    designation: string
}
export interface tab_ressourcesStore {
    ressources_data: tab_ressources[],
    message: string,
    selectedId: string,
    selectedIds: string[],
    selectedCatId: string,
    selectedFamId: string
}
export interface tab_famillesStore {
    familles_data: tab_familles[],
    message: string,
    selectedId: string,
    selectedIds: string[]
}
export interface tab_composites {
    id: string,
    ressource_id: string,
    quantite: number
}
export interface tab_compositesStore {
    composites_data: tab_composites[],
    message: string,
    selectedId: string,
    selectedIds: string[]
}
export interface tab_categoriesStore {
    categories_data: tab_categories[],
    message: string,
    selectedId: string,
    selectedIds: string[]
}
export interface tab_contratStore {
    contrats_data: Contrats[],
    message: string,
    selectedId: string,
    selectedIds: string[],

}
export interface tab_pointageStore {
    pointage_data: pointage[],
    message: string,
    selectedId: string,
    selectedIds: string[],
}
export interface nature_travaux {
    id: string,
    designation: string,
    unite: string
}
export interface travaux {
    id: string,
    date: string,
    nature_id: string,
    quantite: string,
    engin_id: string
}
export interface tab_naturetvxStore {
    nature_tvx_data: nature_travaux[],
    message: string,
    selectedId: string,
    selectedIds: string[]
}
export interface tab_travauxStore {
    travaux_data: travaux[],
    message: string,
    selectedId: string,
    selectedIds: string[],
    selectedDate: string
}
export interface tab_Essais {
    id: string,
    designation: string,
    datas: number[],
    date: string[]
}
export interface datesPointages {
    id: string,
    dates: string
}

export interface tab_dateStore {
    dates: datesPointages[],
    message: string,
    selectedId: string,
}
export interface Users {
    id: string,
    identifiant: string,
    mot_de_passe: string,
    niveau: number,
}
export interface tab_userStore {
    users_data: Users[],
    url: string,
    nivo_requis: number,
    message: string,
}

export interface Statuts {
    id: string,
    designation: string
}
export interface tab_satatutStore {
    statut_data: Statuts[],
    message: string,
}
export interface tab_DevisStore {
    devis_data: Devis[],
    message: string,
    selectedEntreprise_id: string,
    selectedProjet_id: string,
}
export interface tab_LigneDevisStore {
    lignedevis_data: Ligne_devis[],
    message: string,
    selectedDevis_id: string,
}
export interface Constats {
    id: string,
    poste_id: string,
    date: string,
    numero: number,
    rang: number,
    quantite_mois: number,
    description: string,
    decompte_id: string
}
export interface tab_constatStore {
    constat_data: Constats[],
    message: string,
    selected_poste_id: string,
    selected_devis_id: string,
    selected_dp: number
}
export interface ModelAttachement {
    id: string,
    devis_id: string,
    numero: number,
    date: string
}
export interface tab_AttachementStore {
    attachement_data: ModelAttachement[],
    message: string,
    selected_devis_id: string,
    selected_num: number
}
export interface ModelDecompte {
    id: string,
    retenue_avance: number,
    autre_retenue: number,
    devis_id: string,
    numero: number,
    date: string,
    date_depot_bureau: string,
    date_paiement: string
}
export interface tab_DecompteStore {
    decompte_data: ModelDecompte[],
    message: string,
    selected_attach_id: string,
    selected_num: number,
}
export interface taches {
    'id':string,
    'designation': string,
    'uniteid': string,
    'type': string,
    'classe':string
}
export interface tab_tachesStore {
    taches_data: taches[],
    selected_type: string,
     message:string
}
export interface pointage_machine {
    'id': string,
    'date': string,
    'tache_id': string,
    'projet_id': string,
    'engin_id': string,
    'quantite_exec': string
    'duree': string,
    'numero':string
}

export interface tab_pointMachStore {
    pointMach_data: pointage_machine[],
    message:string,
    selected_projetId: string,
    selected_date: string,
    selected_enginId: string,
}
export interface unites {
    'id': string,
    'unite': string
}

export interface tab_unitesStore {
    unites_data:unites[],
    message:string
}
export interface taches_engins
{
    'id':string,
    'taches':string,
    'uniteId':string
}
export interface tab_tachesEnginsStore {
    taches_data: taches_engins[],
    message:string,
    selectedId: string,
}
export interface taches_projet{
    'id':string,
    'projetId':string,
    'tacheId':string,
    'quantiteDqe':number

}
export interface tab_tachesProjetStore {
    taches_data: taches_projet[],
    message:string,
    selectedId: string,
    selectedProjetId:string,
    selectedTacheId:string
}
export interface Entreprise{
    'id':string,
    'enseigne':string,
    'ifu':string,
    'rccm':string,
    'signataire':string
}
export interface tab_EntrepriseStore{
    liste_entreprise:Entreprise[],
    message:string,
    selectedId:string
}