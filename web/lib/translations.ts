// lib/translations.ts

export type LangType = "uz" | "ru" | "en";

// ✅ Strong typing (so missing keys will fail fast in TS)
type TranslationKeys = {
  // Bottom Nav
  nav_menu: string;
  nav_cart: string;
  nav_orders: string;
  nav_profile: string;

  // Menu categories
  cat_non_kabob: string;
  cat_tea: string;
  cat_coffee: string;

  // Profile & Login
  login_title: string;
  login_desc: string;
  login_btn: string;
  call_btn: string;

  // Menu items
  menu_branches: string;
  menu_about: string;
  menu_privacy: string;

  // Settings
  lang_label: string;
  social_label: string;

  // Form
  form_title: string;
  name_label: string;
  phone_label: string;
  address_label: string;
  address_placeholder: string;
  save_btn: string;
  share_phone: string;
  location_btn: string;

  // Sub pages
  branch_title: string;
  branch_name: string;
  about_title: string;
  about_text: string;
  privacy_title: string;
  privacy_text: string;
  contact_title: string;
  contact_copy: string;
  copied: string;

  // Global / Splash
  welcome_select_lang: string;
  continue: string;
};

export const translations: Record<LangType, TranslationKeys> = {
  uz: {
    // --- BOTTOM NAV ---
    nav_menu: "Menyu",
    nav_cart: "Savat",
    nav_orders: "Buyurtmalar",
    nav_profile: "Profil",

    // --- MENU CATEGORIES ---
    cat_non_kabob: "Non Kabob",
    cat_tea: "Choylar",
    cat_coffee: "Qahva",

    // --- PROFILE & LOGIN ---
    login_title: "Profilga kirish",
    login_desc: "Buyurtma berish va kuzatish uchun tizimga kiring.",
    login_btn: "Kirish",
    call_btn: "Biz bilan bog'laning",

    // --- MENU ITEMS ---
    menu_branches: "Bizning filiallar",
    menu_about: "Biz haqimizda",
    menu_privacy: "Maxfiylik siyosati",

    // --- SETTINGS ---
    lang_label: "Ilova tili",
    social_label: "Bizni ijtimoiy tarmoqlarda kuzatib boring",

    // --- FORM ---
    form_title: "Ma'lumotlarni kiritish",
    name_label: "Ismingiz",
    phone_label: "Telefon raqam",
    address_label: "Manzil",
    address_placeholder: "Manzilni aniqlash...",
    save_btn: "Saqlash",
    share_phone: "Raqamni ulashish (Avto)",
    location_btn: "Lokatsiya aniqlanmoqda...",

    // --- SUB PAGES ---
    branch_title: "Filiallar",
    branch_name: "Guliston Shaxar filiali",
    about_title: "Biz haqimizda",
    about_text: "Guliston Nonkabob - bu eng mazali va sifatli taomlar maskani.",
    privacy_title: "Maxfiylik siyosati",
    privacy_text: "Sizning ma'lumotlaringiz qat'iy himoyalangan.",
    contact_title: "Aloqa",
    contact_copy: "Nusxalash",
    copied: "Nusxalandi!",

    // --- GLOBAL / SPLASH ---
    welcome_select_lang: "Iltimos, tilni tanlang",
    continue: "Davom etish",
  },

  ru: {
    // --- BOTTOM NAV ---
    nav_menu: "Меню",
    nav_cart: "Корзина",
    nav_orders: "Заказы",
    nav_profile: "Профиль",

    // --- MENU CATEGORIES ---
    cat_non_kabob: "Нон-кабоб",
    cat_tea: "Чай",
    cat_coffee: "Кофе",

    // --- PROFILE & LOGIN ---
    login_title: "Вход в профиль",
    login_desc: "Войдите, чтобы заказывать и отслеживать доставку.",
    login_btn: "Войти",
    call_btn: "Связаться с нами",

    // --- MENU ITEMS ---
    menu_branches: "Наши филиалы",
    menu_about: "О нас",
    menu_privacy: "Политика конфиденциальности",

    // --- SETTINGS ---
    lang_label: "Язык приложения",
    social_label: "Следите за нами в соцсетях",

    // --- FORM ---
    form_title: "Введите данные",
    name_label: "Ваше имя",
    phone_label: "Номер телефона",
    address_label: "Адрес",
    address_placeholder: "Определение адреса...",
    save_btn: "Сохранить",
    share_phone: "Поделиться номером",
    location_btn: "Определение локации...",

    // --- SUB PAGES ---
    branch_title: "Филиалы",
    branch_name: "Филиал г. Гулистан",
    about_title: "О нас",
    about_text: "Guliston Nonkabob - это место самых вкусных блюд.",
    privacy_title: "Конфиденциальность",
    privacy_text: "Ваши данные надежно защищены.",
    contact_title: "Контакты",
    contact_copy: "Копировать",
    copied: "Скопировано!",

    // --- GLOBAL / SPLASH ---
    welcome_select_lang: "Пожалуйста, выберите язык",
    continue: "Продолжить",
  },

  en: {
    // --- BOTTOM NAV ---
    nav_menu: "Menu",
    nav_cart: "Cart",
    nav_orders: "Orders",
    nav_profile: "Profile",

    // --- MENU CATEGORIES ---
    cat_non_kabob: "Non Kabob",
    cat_tea: "Teas",
    cat_coffee: "Coffee",

    // --- PROFILE & LOGIN ---
    login_title: "Profile Login",
    login_desc: "Log in to order and track deliveries.",
    login_btn: "Log In",
    call_btn: "Contact Us",

    // --- MENU ITEMS ---
    menu_branches: "Our Branches",
    menu_about: "About Us",
    menu_privacy: "Privacy Policy",

    // --- SETTINGS ---
    lang_label: "App Language",
    social_label: "Follow us",

    // --- FORM ---
    form_title: "Enter Details",
    name_label: "Your Name",
    phone_label: "Phone Number",
    address_label: "Address",
    address_placeholder: "Locating address...",
    save_btn: "Save",
    share_phone: "Share Number",
    location_btn: "Locating...",

    // --- SUB PAGES ---
    branch_title: "Branches",
    branch_name: "Guliston City Branch",
    about_title: "About Us",
    about_text: "Guliston Nonkabob is the place for delicious meals.",
    privacy_title: "Privacy Policy",
    privacy_text: "Your data is strictly protected.",
    contact_title: "Contact",
    contact_copy: "Copy",
    copied: "Copied!",

    // --- GLOBAL / SPLASH ---
    welcome_select_lang: "Please select a language",
    continue: "Continue",
  },
};
