import type { DistrictAgent } from "./types";

interface DistrictSeedEntry {
  district: string;
  division: string;
  username: string;
  fullName: string;
  phone: string;
  cashInOrders: number;
  cashOutOrders: number;
}

export const BANGLADESH_64_DISTRICT_SEEDS: DistrictSeedEntry[] = [
  // Sylhet Division (4)
  { district: "Sylhet", division: "Sylhet", username: "sylhet_rafi", fullName: "Rafi Ahmed", phone: "01711482001", cashInOrders: 96, cashOutOrders: 52 },
  { district: "Moulvibazar", division: "Sylhet", username: "moulvibazar_tariq", fullName: "Tariq Chowdhury", phone: "01711482002", cashInOrders: 44, cashOutOrders: 27 },
  { district: "Habiganj", division: "Sylhet", username: "habiganj_shuvo", fullName: "Shuvo Mia", phone: "01711482003", cashInOrders: 39, cashOutOrders: 21 },
  { district: "Sunamganj", division: "Sylhet", username: "sunamganj_nahid", fullName: "Nahid Hasan", phone: "01711482004", cashInOrders: 34, cashOutOrders: 19 },

  // Dhaka Division (13)
  { district: "Dhaka", division: "Dhaka", username: "dhaka_kamrul", fullName: "Kamrul Islam", phone: "01711482005", cashInOrders: 198, cashOutOrders: 114 },
  { district: "Gazipur", division: "Dhaka", username: "gazipur_rakib", fullName: "Rakibul Hasan", phone: "01711482006", cashInOrders: 78, cashOutOrders: 46 },
  { district: "Narayanganj", division: "Dhaka", username: "narayanganj_sohel", fullName: "Sohel Rana", phone: "01711482007", cashInOrders: 71, cashOutOrders: 38 },
  { district: "Tangail", division: "Dhaka", username: "tangail_mehedi", fullName: "Mehedi Hasan", phone: "01711482008", cashInOrders: 52, cashOutOrders: 29 },
  { district: "Narsingdi", division: "Dhaka", username: "narsingdi_imran", fullName: "Imran Hossain", phone: "01711482009", cashInOrders: 47, cashOutOrders: 24 },
  { district: "Faridpur", division: "Dhaka", username: "faridpur_masud", fullName: "Masud Karim", phone: "01711482010", cashInOrders: 42, cashOutOrders: 22 },
  { district: "Kishoreganj", division: "Dhaka", username: "kishoreganj_tanvir", fullName: "Tanvir Alam", phone: "01711482011", cashInOrders: 36, cashOutOrders: 18 },
  { district: "Manikganj", division: "Dhaka", username: "manikganj_saiful", fullName: "Saiful Islam", phone: "01711482012", cashInOrders: 31, cashOutOrders: 16 },
  { district: "Munshiganj", division: "Dhaka", username: "munshiganj_ashik", fullName: "Ashikur Rahman", phone: "01711482013", cashInOrders: 29, cashOutOrders: 15 },
  { district: "Madaripur", division: "Dhaka", username: "madaripur_fahim", fullName: "Fahim Shikder", phone: "01711482014", cashInOrders: 26, cashOutOrders: 14 },
  { district: "Gopalganj", division: "Dhaka", username: "gopalganj_sumon", fullName: "Sumon Mollah", phone: "01711482015", cashInOrders: 28, cashOutOrders: 13 },
  { district: "Rajbari", division: "Dhaka", username: "rajbari_rubel", fullName: "Rubel Mia", phone: "01711482016", cashInOrders: 24, cashOutOrders: 12 },
  { district: "Shariatpur", division: "Dhaka", username: "shariatpur_ripon", fullName: "Ripon Bepari", phone: "01711482017", cashInOrders: 23, cashOutOrders: 11 },

  // Chattogram Division (11)
  { district: "Chattogram", division: "Chattogram", username: "ctg_sajjad", fullName: "Sajjad Hossain", phone: "01811482018", cashInOrders: 132, cashOutOrders: 76 },
  { district: "Cumilla", division: "Chattogram", username: "cumilla_ariful", fullName: "Ariful Haque", phone: "01811482019", cashInOrders: 84, cashOutOrders: 49 },
  { district: "Cox's Bazar", division: "Chattogram", username: "coxsbazar_noman", fullName: "Noman Siddique", phone: "01811482020", cashInOrders: 58, cashOutOrders: 33 },
  { district: "Brahmanbaria", division: "Chattogram", username: "bbaria_jubayer", fullName: "Jubayer Ahmed", phone: "01811482021", cashInOrders: 49, cashOutOrders: 26 },
  { district: "Noakhali", division: "Chattogram", username: "noakhali_mamun", fullName: "Mamunur Rashid", phone: "01811482022", cashInOrders: 53, cashOutOrders: 28 },
  { district: "Feni", division: "Chattogram", username: "feni_shahin", fullName: "Shahin Alam", phone: "01811482023", cashInOrders: 45, cashOutOrders: 23 },
  { district: "Chandpur", division: "Chattogram", username: "chandpur_faisal", fullName: "Faisal Kabir", phone: "01811482024", cashInOrders: 41, cashOutOrders: 21 },
  { district: "Lakshmipur", division: "Chattogram", username: "lakshmipur_hasib", fullName: "Hasibul Islam", phone: "01811482025", cashInOrders: 33, cashOutOrders: 17 },
  { district: "Bandarban", division: "Chattogram", username: "bandarban_maruf", fullName: "Maruf Chakma", phone: "01811482026", cashInOrders: 19, cashOutOrders: 10 },
  { district: "Khagrachhari", division: "Chattogram", username: "khagrachhari_rony", fullName: "Rony Tripura", phone: "01811482027", cashInOrders: 18, cashOutOrders: 9 },
  { district: "Rangamati", division: "Chattogram", username: "rangamati_bikash", fullName: "Bikash Barua", phone: "01811482028", cashInOrders: 21, cashOutOrders: 11 },

  // Rajshahi Division (8)
  { district: "Rajshahi", division: "Rajshahi", username: "rajshahi_sakib", fullName: "Sakib Al Hasan", phone: "01711482029", cashInOrders: 89, cashOutOrders: 51 },
  { district: "Bogura", division: "Rajshahi", username: "bogura_nayeem", fullName: "Nayeem Sarkar", phone: "01711482030", cashInOrders: 68, cashOutOrders: 37 },
  { district: "Pabna", division: "Rajshahi", username: "pabna_farhan", fullName: "Farhan Sadik", phone: "01711482031", cashInOrders: 46, cashOutOrders: 24 },
  { district: "Sirajganj", division: "Rajshahi", username: "sirajganj_liton", fullName: "Liton Talukder", phone: "01711482032", cashInOrders: 43, cashOutOrders: 22 },
  { district: "Naogaon", division: "Rajshahi", username: "naogaon_sharif", fullName: "Sharif Uddin", phone: "01711482033", cashInOrders: 35, cashOutOrders: 18 },
  { district: "Natore", division: "Rajshahi", username: "natore_touhid", fullName: "Touhidul Islam", phone: "01711482034", cashInOrders: 30, cashOutOrders: 15 },
  { district: "Chapainawabganj", division: "Rajshahi", username: "chapai_ashraf", fullName: "Ashraf Ali", phone: "01711482035", cashInOrders: 27, cashOutOrders: 14 },
  { district: "Joypurhat", division: "Rajshahi", username: "joypurhat_mizan", fullName: "Mizanur Rahman", phone: "01711482036", cashInOrders: 22, cashOutOrders: 12 },

  // Khulna Division (10)
  { district: "Khulna", division: "Khulna", username: "khulna_zahid", fullName: "Zahidul Islam", phone: "01911482037", cashInOrders: 82, cashOutOrders: 47 },
  { district: "Jashore", division: "Khulna", username: "jashore_sabbir", fullName: "Sabbir Ahmed", phone: "01911482038", cashInOrders: 57, cashOutOrders: 31 },
  { district: "Kushtia", division: "Khulna", username: "kushtia_ridoy", fullName: "Ridoy Khan", phone: "01911482039", cashInOrders: 48, cashOutOrders: 26 },
  { district: "Satkhira", division: "Khulna", username: "satkhira_emon", fullName: "Emon Hossain", phone: "01911482040", cashInOrders: 37, cashOutOrders: 19 },
  { district: "Bagerhat", division: "Khulna", username: "bagerhat_parvez", fullName: "Parvez Sheikh", phone: "01911482041", cashInOrders: 32, cashOutOrders: 16 },
  { district: "Jhenaidah", division: "Khulna", username: "jhenaidah_siam", fullName: "Siam Mahmud", phone: "01911482042", cashInOrders: 29, cashOutOrders: 15 },
  { district: "Chuadanga", division: "Khulna", username: "chuadanga_rasel", fullName: "Rasel Rana", phone: "01911482043", cashInOrders: 25, cashOutOrders: 13 },
  { district: "Magura", division: "Khulna", username: "magura_shanto", fullName: "Shanto Biswas", phone: "01911482044", cashInOrders: 21, cashOutOrders: 11 },
  { district: "Meherpur", division: "Khulna", username: "meherpur_biplob", fullName: "Biplob Hossain", phone: "01911482045", cashInOrders: 19, cashOutOrders: 10 },
  { district: "Narail", division: "Khulna", username: "narail_al_amin", fullName: "Al Amin Molla", phone: "01911482046", cashInOrders: 20, cashOutOrders: 11 },

  // Barishal Division (6)
  { district: "Barishal", division: "Barishal", username: "barishal_mahmud", fullName: "Mahmudul Hasan", phone: "01711482047", cashInOrders: 64, cashOutOrders: 35 },
  { district: "Bhola", division: "Barishal", username: "bhola_habib", fullName: "Habibur Rahman", phone: "01711482048", cashInOrders: 36, cashOutOrders: 19 },
  { district: "Patuakhali", division: "Barishal", username: "patuakhali_nasir", fullName: "Nasir Uddin", phone: "01711482049", cashInOrders: 31, cashOutOrders: 17 },
  { district: "Pirojpur", division: "Barishal", username: "pirojpur_tuhin", fullName: "Tuhin Hawlader", phone: "01711482050", cashInOrders: 24, cashOutOrders: 12 },
  { district: "Barguna", division: "Barishal", username: "barguna_monir", fullName: "Monirul Islam", phone: "01711482051", cashInOrders: 22, cashOutOrders: 11 },
  { district: "Jhalokati", division: "Barishal", username: "jhalokati_bappy", fullName: "Bappy Akon", phone: "01711482052", cashInOrders: 18, cashOutOrders: 9 },

  // Rangpur Division (8)
  { district: "Rangpur", division: "Rangpur", username: "rangpur_shahriar", fullName: "Shahriar Kabir", phone: "01711482053", cashInOrders: 73, cashOutOrders: 41 },
  { district: "Dinajpur", division: "Rangpur", username: "dinajpur_saikat", fullName: "Saikat Roy", phone: "01711482054", cashInOrders: 51, cashOutOrders: 28 },
  { district: "Gaibandha", division: "Rangpur", username: "gaibandha_khalid", fullName: "Khalid Saifullah", phone: "01711482055", cashInOrders: 34, cashOutOrders: 18 },
  { district: "Kurigram", division: "Rangpur", username: "kurigram_momin", fullName: "Mominul Islam", phone: "01711482056", cashInOrders: 28, cashOutOrders: 15 },
  { district: "Nilphamari", division: "Rangpur", username: "nilphamari_joy", fullName: "Joydeb Das", phone: "01711482057", cashInOrders: 27, cashOutOrders: 14 },
  { district: "Lalmonirhat", division: "Rangpur", username: "lalmonirhat_akash", fullName: "Akash Chandra", phone: "01711482058", cashInOrders: 23, cashOutOrders: 12 },
  { district: "Thakurgaon", division: "Rangpur", username: "thakurgaon_sujon", fullName: "Sujon Barman", phone: "01711482059", cashInOrders: 25, cashOutOrders: 13 },
  { district: "Panchagarh", division: "Rangpur", username: "panchagarh_arif", fullName: "Arifuzzaman", phone: "01711482060", cashInOrders: 21, cashOutOrders: 11 },

  // Mymensingh Division (4)
  { district: "Mymensingh", division: "Mymensingh", username: "mymensingh_tanmoy", fullName: "Tanmoy Sarker", phone: "01711482061", cashInOrders: 69, cashOutOrders: 39 },
  { district: "Jamalpur", division: "Mymensingh", username: "jamalpur_shafiq", fullName: "Shafiqul Islam", phone: "01711482062", cashInOrders: 38, cashOutOrders: 20 },
  { district: "Netrokona", division: "Mymensingh", username: "netrokona_rakib", fullName: "Rakib Talukder", phone: "01711482063", cashInOrders: 30, cashOutOrders: 16 },
  { district: "Sherpur", division: "Mymensingh", username: "sherpur_faruk", fullName: "Faruk Hossain", phone: "01711482064", cashInOrders: 26, cashOutOrders: 14 },
];

export function createSeedDistrictAgents(
  buildAvatar: (label: string, seedIdx?: number) => string
): DistrictAgent[] {
  return BANGLADESH_64_DISTRICT_SEEDS.map((entry, idx) => ({
    id: `agt_${idx + 1}_${entry.district.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`,
    username: entry.username,
    fullName: entry.fullName,
    avatarUrl: buildAvatar(entry.fullName, idx),
    district: entry.district,
    division: entry.division,
    phone: entry.phone,
    channels: ["bKash", "Nagad", "Rocket", "Upay", "Cash"],
    totalOrders: entry.cashInOrders + entry.cashOutOrders,
    cashInOrders: entry.cashInOrders,
    cashOutOrders: entry.cashOutOrders,
    isOnline: true,
    isVerified: true,
  }));
}
