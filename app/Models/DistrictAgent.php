<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DistrictAgent extends Model
{
    use HasFactory;

    protected $fillable = [
        'username',
        'full_name',
        'avatar_url',
        'district',
        'division',
        'phone',
        'channels',
        'total_orders',
        'cash_in_orders',
        'cash_out_orders',
        'is_online',
        'is_verified',
    ];

    protected $casts = [
        'channels' => 'array',
        'is_online' => 'boolean',
        'is_verified' => 'boolean',
    ];

    /**
     * Complete 64-district Bangladesh Agent Network directory.
     */
    public static function directory(): array
    {
        $seeds = [
            // Sylhet Division (4)
            ['Sylhet', 'Sylhet', 'sylhet_rafi', 'Rafi Ahmed', '01711842901', 96, 52],
            ['Moulvibazar', 'Sylhet', 'moulvibazar_tariq', 'Tariqul Islam', '01712842902', 64, 34],
            ['Habiganj', 'Sylhet', 'habiganj_sajid', 'Sajid Mia', '01713842903', 51, 29],
            ['Sunamganj', 'Sylhet', 'sunamganj_nahid', 'Nahid Chowdhury', '01714842904', 47, 25],

            // Dhaka Division (13)
            ['Dhaka', 'Dhaka', 'dhaka_arif', 'Ariful Haque', '01715842905', 182, 114],
            ['Gazipur', 'Dhaka', 'gazipur_rakib', 'Rakibul Hasan', '01716842906', 88, 49],
            ['Narayanganj', 'Dhaka', 'narayanganj_sohel', 'Sohel Rana', '01717842907', 79, 44],
            ['Tangail', 'Dhaka', 'tangail_kamrul', 'Kamrul Islam', '01718842908', 63, 31],
            ['Narsingdi', 'Dhaka', 'narsingdi_imran', 'Imran Hossain', '01719842909', 58, 28],
            ['Kishoreganj', 'Dhaka', 'kishoreganj_tanvir', 'Tanvir Rahman', '01720842910', 54, 27],
            ['Manikganj', 'Dhaka', 'manikganj_shuvo', 'Shuvo Roy', '01721842911', 42, 21],
            ['Munshiganj', 'Dhaka', 'munshiganj_faisal', 'Faisal Mahmud', '01722842912', 49, 24],
            ['Faridpur', 'Dhaka', 'faridpur_masud', 'Masud Parvez', '01723842913', 61, 33],
            ['Gopalganj', 'Dhaka', 'gopalganj_sumon', 'Sumon Mollah', '01724842914', 45, 22],
            ['Madaripur', 'Dhaka', 'madaripur_rubel', 'Rubel Sheikh', '01725842915', 39, 19],
            ['Rajbari', 'Dhaka', 'rajbari_asif', 'Asif Khan', '01726842916', 36, 18],
            ['Shariatpur', 'Dhaka', 'shariatpur_ripon', 'Ripon Bepari', '01727842917', 41, 20],

            // Chattogram Division (11)
            ['Chattogram', 'Chattogram', 'ctg_farhan', 'Farhan Uddin', '01811842918', 154, 92],
            ['Cumilla', 'Chattogram', 'cumilla_saiful', 'Saiful Islam', '01812842919', 102, 58],
            ['Coxs Bazar', 'Chattogram', 'coxsbazar_jahed', 'Jahedul Alam', '01813842920', 77, 41],
            ['Noakhali', 'Chattogram', 'noakhali_mizan', 'Mizanur Rahman', '01814842921', 73, 39],
            ['Feni', 'Chattogram', 'feni_jahid', 'Jahidul Islam', '01815842922', 66, 35],
            ['Brahmanbaria', 'Chattogram', 'bbaria_rasel', 'Rasel Mia', '01816842923', 69, 32],
            ['Chandpur', 'Chattogram', 'chandpur_noman', 'Noman Bhuiyan', '01817842924', 52, 26],
            ['Lakshmipur', 'Chattogram', 'lakshmipur_hasan', 'Hasanuzzaman', '01818842925', 46, 23],
            ['Rangamati', 'Chattogram', 'rangamati_biplob', 'Biplob Chakma', '01819842926', 34, 17],
            ['Bandarban', 'Chattogram', 'bandarban_kyaw', 'Kyaw Marma', '01820842927', 31, 15],
            ['Khagrachari', 'Chattogram', 'khagrachari_dipu', 'Dipu Tripura', '01821842928', 33, 16],

            // Rajshahi Division (8)
            ['Rajshahi', 'Rajshahi', 'rajshahi_mehedi', 'Mehedi Hasan', '01911842929', 94, 53],
            ['Bogura', 'Rajshahi', 'bogura_shahin', 'Shahin Alam', '01912842930', 84, 46],
            ['Pabna', 'Rajshahi', 'pabna_anwar', 'Anwar Hossain', '01913842931', 59, 30],
            ['Sirajganj', 'Rajshahi', 'sirajganj_liton', 'Liton Sarkar', '01914842932', 56, 29],
            ['Naogaon', 'Rajshahi', 'naogaon_habib', 'Habibur Rahman', '01915842933', 48, 24],
            ['Natore', 'Rajshahi', 'natore_sujon', 'Sujon Ali', '01916842934', 44, 21],
            ['Chapainawabganj', 'Rajshahi', 'chapai_raju', 'Raju Ahmed', '01917842935', 40, 19],
            ['Joypurhat', 'Rajshahi', 'joypurhat_tuhin', 'Tuhin Mondal', '01918842936', 37, 18],

            // Khulna Division (10)
            ['Khulna', 'Khulna', 'khulna_shakib', 'Shakib Al Mamun', '01611842937', 91, 50],
            ['Jashore', 'Khulna', 'jashore_nazmul', 'Nazmul Huda', '01612842938', 74, 38],
            ['Kushtia', 'Khulna', 'kushtia_babul', 'Babul Akter', '01613842939', 62, 31],
            ['Satkhira', 'Khulna', 'satkhira_sajib', 'Sajib Biswas', '01614842940', 55, 27],
            ['Bagerhat', 'Khulna', 'bagerhat_monir', 'Monirul Islam', '01615842941', 47, 23],
            ['Jhenaidah', 'Khulna', 'jhenaidah_ashik', 'Ashikur Rahman', '01616842942', 45, 22],
            ['Chuadanga', 'Khulna', 'chuadanga_kawsar', 'Kawsar Ahmed', '01617842943', 38, 19],
            ['Magura', 'Khulna', 'magura_parvez', 'Parvez Hossain', '01618842944', 35, 17],
            ['Meherpur', 'Khulna', 'meherpur_rony', 'Rony Mia', '01619842945', 32, 15],
            ['Narail', 'Khulna', 'narail_taposh', 'Taposh Saha', '01620842946', 34, 16],

            // Barishal Division (6)
            ['Barishal', 'Barishal', 'barishal_mahfuz', 'Mahfuzur Rahman', '01731842947', 81, 45],
            ['Patuakhali', 'Barishal', 'patuakhali_sabuj', 'Sabuj Howlader', '01732842948', 53, 27],
            ['Bhola', 'Barishal', 'bhola_yusuf', 'Yusuf Ali', '01733842949', 49, 25],
            ['Pirojpur', 'Barishal', 'pirojpur_al_amin', 'Al Amin Sikder', '01734842950', 41, 20],
            ['Barguna', 'Barishal', 'barguna_delwar', 'Delwar Hossain', '01735842951', 36, 18],
            ['Jhalokati', 'Barishal', 'jhalokati_salam', 'Abdus Salam', '01736842952', 33, 16],

            // Rangpur Division (8)
            ['Rangpur', 'Rangpur', 'rangpur_mostafa', 'Mostafa Kamal', '01741842953', 87, 48],
            ['Dinajpur', 'Rangpur', 'dinajpur_shafiq', 'Shafiqul Islam', '01742842954', 71, 37],
            ['Gaibandha', 'Rangpur', 'gaibandha_mamun', 'Mamunur Rashid', '01743842955', 52, 26],
            ['Kurigram', 'Rangpur', 'kurigram_azad', 'Azad Hossain', '01744842956', 44, 22],
            ['Lalmonirhat', 'Rangpur', 'lalmonirhat_rafiq', 'Rafiqul Islam', '01745842957', 39, 19],
            ['Nilphamari', 'Rangpur', 'nilphamari_shohag', 'Shohag Mia', '01746842958', 46, 23],
            ['Panchagarh', 'Rangpur', 'panchagarh_nayan', 'Nayan Islam', '01747842959', 35, 17],
            ['Thakurgaon', 'Rangpur', 'thakurgaon_firoz', 'Firoz Kabir', '01748842960', 43, 21],

            // Mymensingh Division (4)
            ['Mymensingh', 'Mymensingh', 'mymensingh_fahim', 'Fahim Hasan', '01751842961', 89, 47],
            ['Jamalpur', 'Mymensingh', 'jamalpur_zakir', 'Zakir Hossain', '01752842962', 57, 29],
            ['Netrokona', 'Mymensingh', 'netrokona_bappi', 'Bappi Talukder', '01753842963', 45, 22],
            ['Sherpur', 'Mymensingh', 'sherpur_salman', 'Salman Shahriar', '01754842964', 41, 20],
        ];

        $agents = [];
        foreach ($seeds as $idx => [$district, $division, $username, $fullName, $phone, $cashIn, $cashOut]) {
            $initials = strtoupper(substr($fullName, 0, 1) . (strpos($fullName, ' ') !== false ? substr($fullName, strpos($fullName, ' ') + 1, 1) : substr($fullName, 1, 1)));
            $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><rect width="120" height="120" rx="60" fill="#0D1A36"/><text x="60" y="72" text-anchor="middle" font-family="system-ui,sans-serif" font-size="40" font-weight="700" fill="#FBBF24">' . $initials . '</text></svg>';
            $agents[] = [
                'id' => 'agt-' . str_pad((string)($idx + 1), 3, '0', STR_PAD_LEFT),
                'username' => $username,
                'fullName' => $fullName,
                'avatarUrl' => 'data:image/svg+xml;utf8,' . rawurlencode($svg),
                'district' => $district,
                'division' => $division,
                'phone' => $phone,
                'channels' => ['bKash', 'Nagad', 'Cash Hand-to-Hand'],
                'totalOrders' => $cashIn + $cashOut,
                'cashInOrders' => $cashIn,
                'cashOutOrders' => $cashOut,
                'isOnline' => true,
                'isVerified' => true,
            ];
        }

        return $agents;
    }
}
