// lib/translations.ts
export type LangType = "uz" | "ru" | "en";

type TranslationKeys = {
  nav_menu: string; nav_cart: string; nav_orders: string; nav_profile: string;
  cat_non_kabob: string; cat_tea: string; cat_coffee: string; cat_waters: string;
  login_title: string; login_desc: string; login_btn: string; call_btn: string;
  menu_branches: string; menu_about: string; menu_privacy: string;
  lang_label: string; social_label: string;
  form_title: string; name_label: string; phone_label: string;
  address_label: string; address_placeholder: string; save_btn: string;
  share_phone: string; location_btn: string;
  branch_title: string; branch_name: string; about_title: string;
  about_text: string; privacy_title: string; privacy_text: string;
  contact_title: string; contact_copy: string; copied: string;
  welcome_select_lang: string; continue: string;
  // NEW KEYS
  add_to_cart: string; item_count: string; delivery_info: string;
  empty_category: string; cart_title: string; cart_empty: string;
  cart_clear: string; cart_total: string; checkout_btn: string;
  order_history_title: string; active_tab: string; history_tab: string;
};

export const translations: Record<LangType, TranslationKeys> = {
  uz: {
    nav_menu: "Menyu", nav_cart: "Savat", nav_orders: "Buyurtma", nav_profile: "Profil",
    cat_non_kabob: "Non Kabob", cat_tea: "Choylar", cat_coffee: "Qahva", cat_waters: "Suvlar",
    login_title: "Profilga kirish", login_desc: "Tizimga kiring", login_btn: "Kirish",
    call_btn: "Biz bilan bog'laning", menu_branches: "Filiallar", menu_about: "Biz haqimizda",
    menu_privacy: "Maxfiylik", lang_label: "Ilova tili", social_label: "Bizni kuzating",
    form_title: "Ma'lumotlar", name_label: "Ism", phone_label: "Telefon",
    address_label: "Manzil", address_placeholder: "Manzilni kiriting...", save_btn: "Saqlash",
    share_phone: "Raqamni ulashish", location_btn: "Lokatsiya...", branch_title: "Filiallar",
    branch_name: "Guliston filiali", about_title: "Haqimizda", about_text: "Mazali taomlar maskani",
    privacy_title: "Maxfiylik", privacy_text: "Himoyalangan", contact_title: "Aloqa",
    contact_copy: "Nusxa", copied: "Nusxalandi!", welcome_select_lang: "Tilni tanlang",
    continue: "Davom etish", add_to_cart: "Qo'shish", item_count: "Soni",
    delivery_info: "Yetkazib berish • Guliston", empty_category: "Mahsulotlar yo'q",
    cart_title: "Savatcha", cart_empty: "Savat bo'sh", cart_clear: "Tozalash",
    cart_total: "Jami summa", checkout_btn: "Buyurtma berish",
    order_history_title: "Buyurtmalarim", active_tab: "Jarayonda", history_tab: "Tarix"
  },
  ru: {
    nav_menu: "Меню", nav_cart: "Корзина", nav_orders: "Заказы", nav_profile: "Профиль",
    cat_non_kabob: "Нон-кабоб", cat_tea: "Чай", cat_coffee: "Кофе", cat_waters: "Воды",
    login_title: "Вход", login_desc: "Войдите в систему", login_btn: "Войти",
    call_btn: "Связаться", menu_branches: "Филиалы", menu_about: "О нас",
    menu_privacy: "Приватность", lang_label: "Язык", social_label: "Соцсети",
    form_title: "Данные", name_label: "Имя", phone_label: "Телефон",
    address_label: "Адрес", address_placeholder: "Введите адрес...", save_btn: "Сохранить",
    share_phone: "Поделиться", location_btn: "Локация...", branch_title: "Филиалы",
    branch_name: "Филиал Гулистан", about_title: "О нас", about_text: "Вкусная еда",
    privacy_title: "Приватность", privacy_text: "Защищено", contact_title: "Контакты",
    contact_copy: "Копия", copied: "Скопировано!", welcome_select_lang: "Выберите язык",
    continue: "Продолжить", add_to_cart: "Добавить", item_count: "Кол-во",
    delivery_info: "Доставка • Гулистан", empty_category: "Нет товаров",
    cart_title: "Корзина", cart_empty: "Корзина пуста", cart_clear: "Очистить",
    cart_total: "Итого", checkout_btn: "Оформить заказ",
    order_history_title: "Мои заказы", active_tab: "В процессе", history_tab: "История"
  },
  en: {
    nav_menu: "Menu", nav_cart: "Cart", nav_orders: "Orders", nav_profile: "Profile",
    cat_non_kabob: "Non Kabob", cat_tea: "Teas", cat_coffee: "Coffee", cat_waters: "Waters",
    login_title: "Login", login_desc: "Please log in", login_btn: "Log In",
    call_btn: "Contact Us", menu_branches: "Branches", menu_about: "About Us",
    menu_privacy: "Privacy", lang_label: "Language", social_label: "Follow us",
    form_title: "Details", name_label: "Name", phone_label: "Phone",
    address_label: "Address", address_placeholder: "Enter address...", save_btn: "Save",
    share_phone: "Share Number", location_btn: "Locating...", branch_title: "Branches",
    branch_name: "Guliston Branch", about_title: "About", about_text: "Delicious meals",
    privacy_title: "Privacy", privacy_text: "Protected", contact_title: "Contact",
    contact_copy: "Copy", copied: "Copied!", welcome_select_lang: "Select language",
    continue: "Continue", add_to_cart: "Add", item_count: "Count",
    delivery_info: "Delivery • Guliston", empty_category: "No products",
    cart_title: "Cart", cart_empty: "Cart is empty", cart_clear: "Clear",
    cart_total: "Total", checkout_btn: "Checkout",
    order_history_title: "My Orders", active_tab: "Active", history_tab: "History"
  }
};