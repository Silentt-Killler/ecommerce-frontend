// Bangladesh Districts & Areas Data
// With Pathao zone mapping for courier integration

export const districts = [
  // Dhaka Division
  {
    id: 1,
    name: "Dhaka",
    bn_name: "ঢাকা",
    division: "Dhaka",
    delivery_zone: "inside_dhaka",
    delivery_charge: 60,
    pathao_city_id: 1,
    areas: [
      { id: 1, name: "Dhanmondi", bn_name: "ধানমন্ডি", pathao_zone_id: 52 },
      { id: 2, name: "Gulshan", bn_name: "গুলশান", pathao_zone_id: 53 },
      { id: 3, name: "Banani", bn_name: "বনানী", pathao_zone_id: 54 },
      { id: 4, name: "Uttara", bn_name: "উত্তরা", pathao_zone_id: 1 },
      { id: 5, name: "Mirpur", bn_name: "মিরপুর", pathao_zone_id: 55 },
      { id: 6, name: "Mohammadpur", bn_name: "মোহাম্মদপুর", pathao_zone_id: 56 },
      { id: 7, name: "Badda", bn_name: "বাড্ডা", pathao_zone_id: 57 },
      { id: 8, name: "Rampura", bn_name: "রামপুরা", pathao_zone_id: 58 },
      { id: 9, name: "Bashundhara", bn_name: "বসুন্ধরা", pathao_zone_id: 59 },
      { id: 10, name: "Tejgaon", bn_name: "তেজগাঁও", pathao_zone_id: 60 },
      { id: 11, name: "Motijheel", bn_name: "মতিঝিল", pathao_zone_id: 61 },
      { id: 12, name: "Paltan", bn_name: "পল্টন", pathao_zone_id: 62 },
      { id: 13, name: "Farmgate", bn_name: "ফার্মগেট", pathao_zone_id: 63 },
      { id: 14, name: "Shahbag", bn_name: "শাহবাগ", pathao_zone_id: 64 },
      { id: 15, name: "Malibagh", bn_name: "মালিবাগ", pathao_zone_id: 65 },
      { id: 16, name: "Khilgaon", bn_name: "খিলগাঁও", pathao_zone_id: 66 },
      { id: 17, name: "Shantinagar", bn_name: "শান্তিনগর", pathao_zone_id: 67 },
      { id: 18, name: "Jatrabari", bn_name: "যাত্রাবাড়ী", pathao_zone_id: 68 },
      { id: 19, name: "Demra", bn_name: "ডেমরা", pathao_zone_id: 69 },
      { id: 20, name: "Lalbagh", bn_name: "লালবাগ", pathao_zone_id: 70 },
      { id: 21, name: "Hazaribagh", bn_name: "হাজারীবাগ", pathao_zone_id: 71 },
      { id: 22, name: "Kamrangirchar", bn_name: "কামরাঙ্গীরচর", pathao_zone_id: 72 },
      { id: 23, name: "Shyamoli", bn_name: "শ্যামলী", pathao_zone_id: 73 },
      { id: 24, name: "Adabor", bn_name: "আদাবর", pathao_zone_id: 74 },
      { id: 25, name: "Agargaon", bn_name: "আগারগাঁও", pathao_zone_id: 75 },
      { id: 26, name: "Sher-e-Bangla Nagar", bn_name: "শেরেবাংলা নগর", pathao_zone_id: 76 },
      { id: 27, name: "Kafrul", bn_name: "কাফরুল", pathao_zone_id: 77 },
      { id: 28, name: "Cantonment", bn_name: "ক্যান্টনমেন্ট", pathao_zone_id: 78 },
      { id: 29, name: "Banasree", bn_name: "বনশ্রী", pathao_zone_id: 79 },
      { id: 30, name: "Aftabnagar", bn_name: "আফতাবনগর", pathao_zone_id: 80 },
      { id: 31, name: "Nikunja", bn_name: "নিকুঞ্জ", pathao_zone_id: 81 },
      { id: 32, name: "Khilkhet", bn_name: "খিলক্ষেত", pathao_zone_id: 82 },
      { id: 33, name: "Vatara", bn_name: "ভাটারা", pathao_zone_id: 83 },
      { id: 34, name: "Dakshinkhan", bn_name: "দক্ষিণখান", pathao_zone_id: 84 },
      { id: 35, name: "Uttarkhan", bn_name: "উত্তরখান", pathao_zone_id: 85 },
      { id: 36, name: "Turag", bn_name: "তুরাগ", pathao_zone_id: 86 },
      { id: 37, name: "Pallabi", bn_name: "পল্লবী", pathao_zone_id: 87 },
      { id: 38, name: "Rupnagar", bn_name: "রূপনগর", pathao_zone_id: 88 },
      { id: 39, name: "Kazipara", bn_name: "কাজীপাড়া", pathao_zone_id: 89 },
      { id: 40, name: "Shewrapara", bn_name: "শেওড়াপাড়া", pathao_zone_id: 90 }
    ]
  },
  {
    id: 2,
    name: "Gazipur",
    bn_name: "গাজীপুর",
    division: "Dhaka",
    delivery_zone: "dhaka_suburban",
    delivery_charge: 100,
    pathao_city_id: 1,
    areas: [
      { id: 101, name: "Gazipur Sadar", bn_name: "গাজীপুর সদর", pathao_zone_id: 201 },
      { id: 102, name: "Tongi", bn_name: "টঙ্গী", pathao_zone_id: 202 },
      { id: 103, name: "Kaliakair", bn_name: "কালিয়াকৈর", pathao_zone_id: 203 },
      { id: 104, name: "Kapasia", bn_name: "কাপাসিয়া", pathao_zone_id: 204 },
      { id: 105, name: "Sreepur", bn_name: "শ্রীপুর", pathao_zone_id: 205 },
      { id: 106, name: "Kaliganj", bn_name: "কালীগঞ্জ", pathao_zone_id: 206 },
      { id: 107, name: "Board Bazar", bn_name: "বোর্ড বাজার", pathao_zone_id: 207 },
      { id: 108, name: "Chandra", bn_name: "চান্দ্রা", pathao_zone_id: 208 },
      { id: 109, name: "Konabari", bn_name: "কোনাবাড়ী", pathao_zone_id: 209 },
      { id: 110, name: "Pubail", bn_name: "পূবাইল", pathao_zone_id: 210 }
    ]
  },
  {
    id: 3,
    name: "Narayanganj",
    bn_name: "নারায়ণগঞ্জ",
    division: "Dhaka",
    delivery_zone: "dhaka_suburban",
    delivery_charge: 100,
    pathao_city_id: 1,
    areas: [
      { id: 201, name: "Narayanganj Sadar", bn_name: "নারায়ণগঞ্জ সদর", pathao_zone_id: 301 },
      { id: 202, name: "Siddhirganj", bn_name: "সিদ্ধিরগঞ্জ", pathao_zone_id: 302 },
      { id: 203, name: "Fatullah", bn_name: "ফতুল্লা", pathao_zone_id: 303 },
      { id: 204, name: "Sonargaon", bn_name: "সোনারগাঁও", pathao_zone_id: 304 },
      { id: 205, name: "Bandar", bn_name: "বন্দর", pathao_zone_id: 305 },
      { id: 206, name: "Araihazar", bn_name: "আড়াইহাজার", pathao_zone_id: 306 },
      { id: 207, name: "Rupganj", bn_name: "রূপগঞ্জ", pathao_zone_id: 307 }
    ]
  },
  {
    id: 4,
    name: "Savar",
    bn_name: "সাভার",
    division: "Dhaka",
    delivery_zone: "dhaka_suburban",
    delivery_charge: 100,
    pathao_city_id: 1,
    areas: [
      { id: 301, name: "Savar Sadar", bn_name: "সাভার সদর", pathao_zone_id: 401 },
      { id: 302, name: "Ashulia", bn_name: "আশুলিয়া", pathao_zone_id: 402 },
      { id: 303, name: "Hemayetpur", bn_name: "হেমায়েতপুর", pathao_zone_id: 403 },
      { id: 304, name: "Dhamrai", bn_name: "ধামরাই", pathao_zone_id: 404 },
      { id: 305, name: "Birulia", bn_name: "বিরুলিয়া", pathao_zone_id: 405 },
      { id: 306, name: "Tetuljhora", bn_name: "তেঁতুলঝোড়া", pathao_zone_id: 406 },
      { id: 307, name: "Aminbazar", bn_name: "আমিনবাজার", pathao_zone_id: 407 }
    ]
  },
  {
    id: 5,
    name: "Keraniganj",
    bn_name: "কেরানীগঞ্জ",
    division: "Dhaka",
    delivery_zone: "dhaka_suburban",
    delivery_charge: 100,
    pathao_city_id: 1,
    areas: [
      { id: 401, name: "Keraniganj Sadar", bn_name: "কেরানীগঞ্জ সদর", pathao_zone_id: 501 },
      { id: 402, name: "South Keraniganj", bn_name: "দক্ষিণ কেরানীগঞ্জ", pathao_zone_id: 502 },
      { id: 403, name: "Nawabganj", bn_name: "নবাবগঞ্জ", pathao_zone_id: 503 }
    ]
  },
  
  // Chittagong Division
  {
    id: 10,
    name: "Chittagong",
    bn_name: "চট্টগ্রাম",
    division: "Chittagong",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 2,
    areas: [
      { id: 501, name: "Agrabad", bn_name: "আগ্রাবাদ", pathao_zone_id: 601 },
      { id: 502, name: "Nasirabad", bn_name: "নাসিরাবাদ", pathao_zone_id: 602 },
      { id: 503, name: "Khulshi", bn_name: "খুলশী", pathao_zone_id: 603 },
      { id: 504, name: "Panchlaish", bn_name: "পাঁচলাইশ", pathao_zone_id: 604 },
      { id: 505, name: "Halishahar", bn_name: "হালিশহর", pathao_zone_id: 605 },
      { id: 506, name: "Pahartali", bn_name: "পাহাড়তলী", pathao_zone_id: 606 },
      { id: 507, name: "Patenga", bn_name: "পতেঙ্গা", pathao_zone_id: 607 },
      { id: 508, name: "Kotwali", bn_name: "কোতোয়ালী", pathao_zone_id: 608 },
      { id: 509, name: "Double Mooring", bn_name: "ডবলমুরিং", pathao_zone_id: 609 },
      { id: 510, name: "Bakalia", bn_name: "বাকলিয়া", pathao_zone_id: 610 },
      { id: 511, name: "Chandgaon", bn_name: "চান্দগাঁও", pathao_zone_id: 611 },
      { id: 512, name: "Bayazid", bn_name: "বায়েজিদ", pathao_zone_id: 612 },
      { id: 513, name: "GEC Circle", bn_name: "জিইসি সার্কেল", pathao_zone_id: 613 },
      { id: 514, name: "Muradpur", bn_name: "মুরাদপুর", pathao_zone_id: 614 },
      { id: 515, name: "Oxygen", bn_name: "অক্সিজেন", pathao_zone_id: 615 }
    ]
  },
  {
    id: 11,
    name: "Cox's Bazar",
    bn_name: "কক্সবাজার",
    division: "Chittagong",
    delivery_zone: "outside_dhaka",
    delivery_charge: 130,
    pathao_city_id: 11,
    areas: [
      { id: 601, name: "Cox's Bazar Sadar", bn_name: "কক্সবাজার সদর", pathao_zone_id: 701 },
      { id: 602, name: "Teknaf", bn_name: "টেকনাফ", pathao_zone_id: 702 },
      { id: 603, name: "Ukhia", bn_name: "উখিয়া", pathao_zone_id: 703 },
      { id: 604, name: "Ramu", bn_name: "রামু", pathao_zone_id: 704 },
      { id: 605, name: "Chakaria", bn_name: "চকরিয়া", pathao_zone_id: 705 },
      { id: 606, name: "Maheshkhali", bn_name: "মহেশখালী", pathao_zone_id: 706 },
      { id: 607, name: "Kutubdia", bn_name: "কুতুবদিয়া", pathao_zone_id: 707 }
    ]
  },
  {
    id: 12,
    name: "Comilla",
    bn_name: "কুমিল্লা",
    division: "Chittagong",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 5,
    areas: [
      { id: 701, name: "Comilla Sadar", bn_name: "কুমিল্লা সদর", pathao_zone_id: 801 },
      { id: 702, name: "Comilla Sadar South", bn_name: "কুমিল্লা সদর দক্ষিণ", pathao_zone_id: 802 },
      { id: 703, name: "Daudkandi", bn_name: "দাউদকান্দি", pathao_zone_id: 803 },
      { id: 704, name: "Muradnagar", bn_name: "মুরাদনগর", pathao_zone_id: 804 },
      { id: 705, name: "Brahmanpara", bn_name: "ব্রাহ্মণপাড়া", pathao_zone_id: 805 },
      { id: 706, name: "Chandina", bn_name: "চান্দিনা", pathao_zone_id: 806 },
      { id: 707, name: "Debidwar", bn_name: "দেবীদ্বার", pathao_zone_id: 807 },
      { id: 708, name: "Burichong", bn_name: "বুড়িচং", pathao_zone_id: 808 }
    ]
  },

  // Sylhet Division
  {
    id: 20,
    name: "Sylhet",
    bn_name: "সিলেট",
    division: "Sylhet",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 3,
    areas: [
      { id: 801, name: "Sylhet Sadar", bn_name: "সিলেট সদর", pathao_zone_id: 901 },
      { id: 802, name: "Zindabazar", bn_name: "জিন্দাবাজার", pathao_zone_id: 902 },
      { id: 803, name: "Amberkhana", bn_name: "আম্বরখানা", pathao_zone_id: 903 },
      { id: 804, name: "Subid Bazar", bn_name: "সুবিদ বাজার", pathao_zone_id: 904 },
      { id: 805, name: "Kumarpara", bn_name: "কুমারপাড়া", pathao_zone_id: 905 },
      { id: 806, name: "Shahjalal Upashahar", bn_name: "শাহজালাল উপশহর", pathao_zone_id: 906 },
      { id: 807, name: "South Surma", bn_name: "দক্ষিণ সুরমা", pathao_zone_id: 907 },
      { id: 808, name: "Beanibazar", bn_name: "বিয়ানীবাজার", pathao_zone_id: 908 },
      { id: 809, name: "Golapganj", bn_name: "গোলাপগঞ্জ", pathao_zone_id: 909 },
      { id: 810, name: "Jaintiapur", bn_name: "জৈন্তাপুর", pathao_zone_id: 910 }
    ]
  },

  // Rajshahi Division
  {
    id: 30,
    name: "Rajshahi",
    bn_name: "রাজশাহী",
    division: "Rajshahi",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 4,
    areas: [
      { id: 901, name: "Rajshahi Sadar", bn_name: "রাজশাহী সদর", pathao_zone_id: 1001 },
      { id: 902, name: "Boalia", bn_name: "বোয়ালিয়া", pathao_zone_id: 1002 },
      { id: 903, name: "Rajpara", bn_name: "রাজপাড়া", pathao_zone_id: 1003 },
      { id: 904, name: "Motihar", bn_name: "মতিহার", pathao_zone_id: 1004 },
      { id: 905, name: "Shah Makhdum", bn_name: "শাহ মখদুম", pathao_zone_id: 1005 },
      { id: 906, name: "Paba", bn_name: "পবা", pathao_zone_id: 1006 },
      { id: 907, name: "Godagari", bn_name: "গোদাগাড়ী", pathao_zone_id: 1007 },
      { id: 908, name: "Tanore", bn_name: "তানোর", pathao_zone_id: 1008 }
    ]
  },

  // Khulna Division
  {
    id: 40,
    name: "Khulna",
    bn_name: "খুলনা",
    division: "Khulna",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 6,
    areas: [
      { id: 1001, name: "Khulna Sadar", bn_name: "খুলনা সদর", pathao_zone_id: 1101 },
      { id: 1002, name: "Sonadanga", bn_name: "সোনাডাঙ্গা", pathao_zone_id: 1102 },
      { id: 1003, name: "Khalishpur", bn_name: "খালিশপুর", pathao_zone_id: 1103 },
      { id: 1004, name: "Daulatpur", bn_name: "দৌলতপুর", pathao_zone_id: 1104 },
      { id: 1005, name: "Khan Jahan Ali", bn_name: "খান জাহান আলী", pathao_zone_id: 1105 },
      { id: 1006, name: "Rupsha", bn_name: "রূপসা", pathao_zone_id: 1106 },
      { id: 1007, name: "Phultala", bn_name: "ফুলতলা", pathao_zone_id: 1107 }
    ]
  },

  // Barishal Division
  {
    id: 50,
    name: "Barishal",
    bn_name: "বরিশাল",
    division: "Barishal",
    delivery_zone: "outside_dhaka",
    delivery_charge: 130,
    pathao_city_id: 17,
    areas: [
      { id: 1101, name: "Barishal Sadar", bn_name: "বরিশাল সদর", pathao_zone_id: 1201 },
      { id: 1102, name: "Kotwali", bn_name: "কোতোয়ালী", pathao_zone_id: 1202 },
      { id: 1103, name: "Bandar", bn_name: "বন্দর", pathao_zone_id: 1203 },
      { id: 1104, name: "Bakerganj", bn_name: "বাকেরগঞ্জ", pathao_zone_id: 1204 },
      { id: 1105, name: "Babuganj", bn_name: "বাবুগঞ্জ", pathao_zone_id: 1205 },
      { id: 1106, name: "Gournadi", bn_name: "গৌরনদী", pathao_zone_id: 1206 }
    ]
  },

  // Rangpur Division
  {
    id: 60,
    name: "Rangpur",
    bn_name: "রংপুর",
    division: "Rangpur",
    delivery_zone: "outside_dhaka",
    delivery_charge: 130,
    pathao_city_id: 8,
    areas: [
      { id: 1201, name: "Rangpur Sadar", bn_name: "রংপুর সদর", pathao_zone_id: 1301 },
      { id: 1202, name: "Rangpur City", bn_name: "রংপুর সিটি", pathao_zone_id: 1302 },
      { id: 1203, name: "Kaunia", bn_name: "কাউনিয়া", pathao_zone_id: 1303 },
      { id: 1204, name: "Gangachara", bn_name: "গঙ্গাচড়া", pathao_zone_id: 1304 },
      { id: 1205, name: "Taraganj", bn_name: "তারাগঞ্জ", pathao_zone_id: 1305 },
      { id: 1206, name: "Badarganj", bn_name: "বদরগঞ্জ", pathao_zone_id: 1306 },
      { id: 1207, name: "Mithapukur", bn_name: "মিঠাপুকুর", pathao_zone_id: 1307 },
      { id: 1208, name: "Pirganj", bn_name: "পীরগঞ্জ", pathao_zone_id: 1308 }
    ]
  },

  // Mymensingh Division
  {
    id: 70,
    name: "Mymensingh",
    bn_name: "ময়মনসিংহ",
    division: "Mymensingh",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 9,
    areas: [
      { id: 1301, name: "Mymensingh Sadar", bn_name: "ময়মনসিংহ সদর", pathao_zone_id: 1401 },
      { id: 1302, name: "Trishal", bn_name: "ত্রিশাল", pathao_zone_id: 1402 },
      { id: 1303, name: "Bhaluka", bn_name: "ভালুকা", pathao_zone_id: 1403 },
      { id: 1304, name: "Muktagacha", bn_name: "মুক্তাগাছা", pathao_zone_id: 1404 },
      { id: 1305, name: "Fulbaria", bn_name: "ফুলবাড়িয়া", pathao_zone_id: 1405 },
      { id: 1306, name: "Gaffargaon", bn_name: "গফরগাঁও", pathao_zone_id: 1406 },
      { id: 1307, name: "Ishwarganj", bn_name: "ঈশ্বরগঞ্জ", pathao_zone_id: 1407 },
      { id: 1308, name: "Nandail", bn_name: "নান্দাইল", pathao_zone_id: 1408 }
    ]
  },

  // More districts
  {
    id: 80,
    name: "Bogura",
    bn_name: "বগুড়া",
    division: "Rajshahi",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 10,
    areas: [
      { id: 1401, name: "Bogura Sadar", bn_name: "বগুড়া সদর", pathao_zone_id: 1501 },
      { id: 1402, name: "Shahjahanpur", bn_name: "শাহজাহানপুর", pathao_zone_id: 1502 },
      { id: 1403, name: "Sherpur", bn_name: "শেরপুর", pathao_zone_id: 1503 },
      { id: 1404, name: "Shibganj", bn_name: "শিবগঞ্জ", pathao_zone_id: 1504 },
      { id: 1405, name: "Gabtali", bn_name: "গাবতলী", pathao_zone_id: 1505 }
    ]
  },
  {
    id: 81,
    name: "Dinajpur",
    bn_name: "দিনাজপুর",
    division: "Rangpur",
    delivery_zone: "outside_dhaka",
    delivery_charge: 130,
    pathao_city_id: 12,
    areas: [
      { id: 1501, name: "Dinajpur Sadar", bn_name: "দিনাজপুর সদর", pathao_zone_id: 1601 },
      { id: 1502, name: "Birampur", bn_name: "বিরামপুর", pathao_zone_id: 1602 },
      { id: 1503, name: "Birganj", bn_name: "বীরগঞ্জ", pathao_zone_id: 1603 },
      { id: 1504, name: "Parbatipur", bn_name: "পার্বতীপুর", pathao_zone_id: 1604 },
      { id: 1505, name: "Phulbari", bn_name: "ফুলবাড়ী", pathao_zone_id: 1605 }
    ]
  },
  {
    id: 82,
    name: "Jessore",
    bn_name: "যশোর",
    division: "Khulna",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 13,
    areas: [
      { id: 1601, name: "Jessore Sadar", bn_name: "যশোর সদর", pathao_zone_id: 1701 },
      { id: 1602, name: "Benapole", bn_name: "বেনাপোল", pathao_zone_id: 1702 },
      { id: 1603, name: "Sharsha", bn_name: "শার্শা", pathao_zone_id: 1703 },
      { id: 1604, name: "Jhikargacha", bn_name: "ঝিকরগাছা", pathao_zone_id: 1704 },
      { id: 1605, name: "Manirampur", bn_name: "মণিরামপুর", pathao_zone_id: 1705 },
      { id: 1606, name: "Abhaynagar", bn_name: "অভয়নগর", pathao_zone_id: 1706 }
    ]
  },
  {
    id: 83,
    name: "Feni",
    bn_name: "ফেনী",
    division: "Chittagong",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 14,
    areas: [
      { id: 1701, name: "Feni Sadar", bn_name: "ফেনী সদর", pathao_zone_id: 1801 },
      { id: 1702, name: "Chhagalnaiya", bn_name: "ছাগলনাইয়া", pathao_zone_id: 1802 },
      { id: 1703, name: "Daganbhuiyan", bn_name: "দাগনভূঁইয়া", pathao_zone_id: 1803 },
      { id: 1704, name: "Parshuram", bn_name: "পরশুরাম", pathao_zone_id: 1804 },
      { id: 1705, name: "Sonagazi", bn_name: "সোনাগাজী", pathao_zone_id: 1805 }
    ]
  },
  {
    id: 84,
    name: "Brahmanbaria",
    bn_name: "ব্রাহ্মণবাড়িয়া",
    division: "Chittagong",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 32,
    areas: [
      { id: 1801, name: "Brahmanbaria Sadar", bn_name: "ব্রাহ্মণবাড়িয়া সদর", pathao_zone_id: 1901 },
      { id: 1802, name: "Ashuganj", bn_name: "আশুগঞ্জ", pathao_zone_id: 1902 },
      { id: 1803, name: "Kasba", bn_name: "কসবা", pathao_zone_id: 1903 },
      { id: 1804, name: "Nabinagar", bn_name: "নবীনগর", pathao_zone_id: 1904 },
      { id: 1805, name: "Sarail", bn_name: "সরাইল", pathao_zone_id: 1905 }
    ]
  },
  {
    id: 85,
    name: "Tangail",
    bn_name: "টাঙ্গাইল",
    division: "Dhaka",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 15,
    areas: [
      { id: 1901, name: "Tangail Sadar", bn_name: "টাঙ্গাইল সদর", pathao_zone_id: 2001 },
      { id: 1902, name: "Mirzapur", bn_name: "মির্জাপুর", pathao_zone_id: 2002 },
      { id: 1903, name: "Gopalpur", bn_name: "গোপালপুর", pathao_zone_id: 2003 },
      { id: 1904, name: "Basail", bn_name: "বাসাইল", pathao_zone_id: 2004 },
      { id: 1905, name: "Madhupur", bn_name: "মধুপুর", pathao_zone_id: 2005 },
      { id: 1906, name: "Ghatail", bn_name: "ঘাটাইল", pathao_zone_id: 2006 },
      { id: 1907, name: "Kalihati", bn_name: "কালিহাতি", pathao_zone_id: 2007 }
    ]
  },
  {
    id: 86,
    name: "Narsingdi",
    bn_name: "নরসিংদী",
    division: "Dhaka",
    delivery_zone: "dhaka_suburban",
    delivery_charge: 100,
    pathao_city_id: 16,
    areas: [
      { id: 2001, name: "Narsingdi Sadar", bn_name: "নরসিংদী সদর", pathao_zone_id: 2101 },
      { id: 2002, name: "Palash", bn_name: "পলাশ", pathao_zone_id: 2102 },
      { id: 2003, name: "Shibpur", bn_name: "শিবপুর", pathao_zone_id: 2103 },
      { id: 2004, name: "Belabo", bn_name: "বেলাবো", pathao_zone_id: 2104 },
      { id: 2005, name: "Monohardi", bn_name: "মনোহরদী", pathao_zone_id: 2105 },
      { id: 2006, name: "Raipura", bn_name: "রায়পুরা", pathao_zone_id: 2106 }
    ]
  },
  {
    id: 87,
    name: "Manikganj",
    bn_name: "মানিকগঞ্জ",
    division: "Dhaka",
    delivery_zone: "outside_dhaka",
    delivery_charge: 120,
    pathao_city_id: 18,
    areas: [
      { id: 2101, name: "Manikganj Sadar", bn_name: "মানিকগঞ্জ সদর", pathao_zone_id: 2201 },
      { id: 2102, name: "Singair", bn_name: "সিংগাইর", pathao_zone_id: 2202 },
      { id: 2103, name: "Saturia", bn_name: "সাটুরিয়া", pathao_zone_id: 2203 },
      { id: 2104, name: "Harirampur", bn_name: "হরিরামপুর", pathao_zone_id: 2204 },
      { id: 2105, name: "Ghior", bn_name: "ঘিওর", pathao_zone_id: 2205 }
    ]
  },
  {
    id: 88,
    name: "Munshiganj",
    bn_name: "মুন্সীগঞ্জ",
    division: "Dhaka",
    delivery_zone: "dhaka_suburban",
    delivery_charge: 100,
    pathao_city_id: 19,
    areas: [
      { id: 2201, name: "Munshiganj Sadar", bn_name: "মুন্সীগঞ্জ সদর", pathao_zone_id: 2301 },
      { id: 2202, name: "Sreenagar", bn_name: "শ্রীনগর", pathao_zone_id: 2302 },
      { id: 2203, name: "Sirajdikhan", bn_name: "সিরাজদিখান", pathao_zone_id: 2303 },
      { id: 2204, name: "Louhajang", bn_name: "লৌহজং", pathao_zone_id: 2304 },
      { id: 2205, name: "Tongibari", bn_name: "টঙ্গীবাড়ী", pathao_zone_id: 2305 },
      { id: 2206, name: "Gazaria", bn_name: "গজারিয়া", pathao_zone_id: 2306 }
    ]
  }
];

// Helper functions
export function getAreasByDistrict(districtName) {
  const district = districts.find(d => d.name === districtName);
  return district ? district.areas : [];
}

export function getDeliveryCharge(districtName) {
  const district = districts.find(d => d.name === districtName);
  return district ? district.delivery_charge : 120; // Default to outside dhaka
}

export function getDeliveryZone(districtName) {
  const district = districts.find(d => d.name === districtName);
  return district ? district.delivery_zone : 'outside_dhaka';
}

export function getPathaoMapping(districtName, areaName) {
  const district = districts.find(d => d.name === districtName);
  if (!district) return null;
  
  const area = district.areas.find(a => a.name === areaName);
  if (!area) return null;
  
  return {
    city_id: district.pathao_city_id,
    zone_id: area.pathao_zone_id
  };
}

// Export all districts for dropdown
export function getAllDistricts() {
  return districts.map(d => ({
    id: d.id,
    name: d.name,
    bn_name: d.bn_name,
    delivery_zone: d.delivery_zone,
    delivery_charge: d.delivery_charge,
    pathao_city_id: d.pathao_city_id
  }));
}

export default districts;
