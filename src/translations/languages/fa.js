// Persian (Farsi) translations
const fa = {
  // Common UI elements
  common: {
    save: 'ذخیره',
    cancel: 'لغو',
    edit: 'ویرایش',
    delete: 'حذف',
    submit: 'ارسال',
    loading: 'در حال بارگذاری',
    search: 'جستجو',
    filter: 'فیلتر',
    yes: 'بله',
    no: 'خیر',
    back: 'بازگشت',
    next: 'بعدی',
    previous: 'قبلی',
    close: 'بستن',
    open: 'باز کردن',
    view: 'مشاهده',
    download: 'دانلود',
    upload: 'آپلود',
    add: 'افزودن',
    remove: 'حذف',
    create: 'ایجاد',
    update: 'بروزرسانی',
    select: 'انتخاب',
    logout: 'خروج',
    ok: 'تأیید',
    cancel: 'انصراف',
    delete: 'حذف',
    to: 'تا',
    error: 'خطا',
    success: 'موفقیت',
    reset: 'بازنشانی',
    sortBy: 'مرتب‌سازی بر اساس',
    order: 'ترتیب'
  },

  // Not Found Page
  notFound: {
    title: 'صفحه یافت نشد ⚠️',
    description: 'متأسفانه صفحه مورد نظر شما یافت نشد.',
    backToHome: 'بازگشت به صفحه اصلی',
    illustrationAlt: 'تصویر خطای ۴۰۴',
    maskAlt: 'تصویر پس‌زمینه'
  },

  // Live Page
  live: {
    title: 'پخش زنده',
    reports: 'گزارش ها',
    addNewPerson: 'افزودن شخص جدید',
    loading: 'در حال بارگذاری...',
    noReports: 'گزارشی موجود نیست',
    addPersonModal: {
      title: 'افزودن شخص جدید',
      name: 'نام',
      lastName: 'نام خانوادگی',
      nationalCode: 'کد ملی',
      nationalCodeLimit: 'کد ملی باید ۱۰ رقم باشد',
      gender: 'جنسیت',
      male: 'آقا',
      female: 'خانم',
      access: 'دسترسی',
      allowed: 'مجاز',
      notAllowed: 'غیر مجاز',
      cancel: 'انصراف',
      add: 'افزودن'
    }
  },

  // Report Card
  reportCard: {
    noReport: 'گزارشی موجود نیست',
    nationalCode: 'کد ملی',
    gender: 'جنسیت',
    male: 'آقا',
    female: 'خانم',
    unknown: 'نامشخص',
    status: 'وضعیت',
    access: 'دسترسی',
    allowed: 'مجاز',
    notAllowed: 'غیر مجاز',
    details: 'جزئیات',
    editInfo: 'ویرایش اطلاعات',
    addToAllowed: 'اضافه کردن به لیست مجاز',
    editPerson: 'ویرایش شخص',
    update: 'بروزرسانی',
    add: 'افزودن',
    cancel: 'انصراف',
    fillRequiredFields: 'لطفاً تمام فیلدهای ضروری را پر کنید',
    updateFailed: 'بروزرسانی انجام نشد',
    userImage: 'تصویر آپلود شده',
    apiImage: 'آخرین تردد',
    uploadImage: 'آپلود تصویر',
    name: 'نام',
    lastName: 'نام خانوادگی',
    id: 'آیدی',
    date: 'تاریخ تشخیص',
    time: 'زمان تشخیص',
    downloadCardAsImage: 'دانلود گزارش',
    downloadProfileImage: 'دانلود تصویر پروفایل',
    downloadLastImage: 'دانلود تصویر آخرین تردد',
    fullName: 'نام و نام خانوادگی',
    invalidImageType: 'نوع فایل نامعتبر است. لطفاً یک تصویر انتخاب کنید.',
    imageTooLarge: 'حجم فایل بسیار بزرگ است. حداکثر 5 مگابایت مجاز است.',

    // Add any missing keys for Reports modals/filters
    filter: 'فیلتر',
    reset: 'بازنشانی',
    edit: 'ویرایش',
    save: 'ذخیره',
    close: 'بستن',
    previous: 'قبلی',
    next: 'بعدی',
    search: 'جستجو',
    sortBy: 'مرتب‌سازی بر اساس',
    sortOrder: 'ترتیب',
    ascending: 'صعودی',
    descending: 'نزولی',
    order: 'ترتیب',
    sortFields: {
      created_at: 'تاریخ',
      person_id: 'شناسه شخص',
      confidence: 'دقت',
      fiqa: 'کیفیت تصویر',
      camera_id: 'دوربین'
    },
    itemsPerPage: 'تعداد در هر صفحه',
    noReports: 'گزارشی موجود نیست',
    loading: 'در حال بارگذاری...',

    // New keys for person reports
    personId: 'شناسه شخص',
    camera: 'دوربین',
    confidence: 'دقت',
    fiqa: 'کیفیت تصویر',
    similarityScore: 'امتیاز شباهت',
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'تاریخ بروزرسانی',
    detectedImage: 'تصویر تشخیص داده شده',
    personImage: 'تصویر شخص',
    downloadDetectedImage: 'دانلود تصویر تشخیص',
    downloadPersonImage: 'دانلود تصویر شخص',
    boundingBox: 'محدوده تشخیص',
    min: 'حداقل',
    max: 'حداکثر',
    to: 'تا',
    loading: 'در حال بارگذاری...',
    unknown: 'نامشخص'
  },

  access: {
    title: 'اشخاص',
    addNewPerson: 'افزودن شخص جدید',
    loading: 'در حال بارگذاری...',
    noPersons: 'شخصی موجود نیست',
    itemsPerPage: 'تعداد در هر صفحه',
    filter: {
      persons: 'اشخاص',
      access: 'دسترسی',
      gender: 'جنسیت',
      searchBy: 'جستجو بر اساس',
      name: 'نام',
      id: 'آیدی',
      nationalCode: 'کد ملی',
      firstName: 'نام',
      lastName: 'نام خانوادگی',
      searchPlaceholder: 'جستجو...',
      reset: 'بازنشانی',
      placeholder_first_name: 'نام',
      placeholder_last_name: 'نام خانوادگی',
      placeholder_person_id: 'آیدی',
      placeholder_national_code: 'کد ملی'
    },
    confirmDelete: 'تأیید حذف',
    confirmDeleteMessage: 'آیا مطمئن هستید که می‌خواهید این شخص را حذف کنید؟',
    delete: 'حذف',
    deleting: 'در حال حذف...',
    addPersonModal: {
      title: 'افزودن شخص جدید',
      name: 'نام',
      lastName: 'نام خانوادگی',
      nationalCode: 'کد ملی',
      nationalCodeLimit: 'کد ملی باید 10 رقم باشد',
      gender: 'جنسیت',
      male: 'آقا',
      female: 'خانم',
      uploadImage: 'آپلود تصویر',
      cancel: 'انصراف',
      add: 'افزودن',
      allowed: 'مجاز',
      notAllowed: 'غیر مجاز',
      access: 'دسترسی'
    }
  },

  //users

  users: {
    title: 'مدیریت کاربران',
    addUser: 'افزودن کاربر',
    editUser: 'ویرایش کاربر',
    deleteUser: 'حذف کاربر',
    deleteConfirm: 'آیا از حذف کاربر "{name}" اطمینان دارید؟',
    confirmDelete: 'آیا از حذف این کاربر اطمینان دارید؟',
    avatar: 'تصویر پروفایل',
    fullName: 'نام و نام خانوادگی',
    firstName: 'نام',
    lastName: 'نام خانوادگی',
    username: 'نام کاربری',
    email: 'ایمیل',
    password: 'رمز عبور',
    phone: 'شماره تماس',
    phoneNumber: 'شماره تماس',
    address: 'آدرس',
    bio: 'درباره',
    role: 'نقش',
    status: 'وضعیت',
    actions: 'عملیات',
    profile: 'پروفایل',
    security: 'امنیت',
    accountDetails: 'جزئیات حساب',
    editProfile: 'ویرایش پروفایل',
    saveChanges: 'ذخیره تغییرات',
    changePassword: 'تغییر رمز عبور',
    currentPassword: 'رمز عبور فعلی',
    newPassword: 'رمز عبور جدید',
    confirmPassword: 'تایید رمز عبور',
    uploadAvatar: 'آپلود تصویر',
    add: 'افزودن',
    userDetail: 'جزئیات کاربر',
    noData: 'کاربری یافت نشد',
    loading: 'درحال بارگزاری کاربرها',
    passwordMinLength: 'رمز عبور باید حداقل ۸ کاراکتر باشد',
    phoneNumberFormat: 'شماره تماس باید دقیقاً ۱۱ رقم باشد',

    // New translations
    roleOptions: {
      admin: 'مدیر',
      user: 'کاربر عادی'
    },
    statusOptions: {
      active: 'فعال',
      inactive: 'غیرفعال'
    },

    // User Edit Component Translations
    userEdit: {
      title: 'ویرایش کاربر',
      description: 'ویرایش اطلاعات کاربر در سیستم تشخیص چهره دیانا',
      keywords: 'ویرایش کاربر, مدیریت کاربران, سیستم تشخیص چهره دیانا',
      userInfo: {
        title: 'اطلاعات کاربر',
        role: 'نقش',
        status: 'وضعیت',
        email: 'ایمیل',
        phone: 'شماره تماس',
        address: 'آدرس',
        bio: 'درباره'
      },
      accountDetails: {
        title: 'جزئیات حساب',
        fullName: 'نام و نام خانوادگی',
        username: 'نام کاربری',
        email: 'ایمیل',
        phone: 'شماره تماس',
        address: 'آدرس',
        bio: 'درباره',
        role: 'نقش',
        status: 'وضعیت'
      },
      security: {
        title: 'امنیت',
        changePassword: 'تغییر رمز عبور',
        currentPassword: 'رمز عبور فعلی',
        newPassword: 'رمز عبور جدید',
        confirmPassword: 'تایید رمز عبور'
      },
      actions: {
        edit: 'ویرایش',
        save: 'ذخیره',
        cancel: 'انصراف',
        uploadAvatar: 'آپلود تصویر'
      }
    }
  },

  //groups
  groups: {
    groups: 'گروه ها',
    title: 'مدیریت گروه‌ها',
    addGroup: 'افزودن گروه',
    editGroup: 'ویرایش گروه',
    deleteGroup: 'حذف گروه',
    confirmDelete: 'آیا از حذف این گروه اطمینان دارید؟'
  },

  //cameras
  cameras: {
    title: 'مدیریت دوربین‌ها',
    addCamera: 'افزودن دوربین',
    editCamera: 'ویرایش دوربین',
    deleteCamera: 'حذف دوربین',
    deleteConfirm: 'آیا از حذف دوربین "{name}" اطمینان دارید؟',
    confirmDelete: 'آیا از حذف این دوربین اطمینان دارید؟',
    name: 'نام دوربین',
    camUrl: 'آدرس دوربین',
    camUser: 'نام کاربری دوربین',
    camPassword: 'رمز عبور دوربین',
    id: 'شناسه',
    isActive: 'وضعیت',
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'تاریخ بروزرسانی',
    status: 'وضعیت',
    actions: 'عملیات',
    noData: 'دوربینی یافت نشد',
    loading: 'درحال بارگزاری دوربین‌ها',
    cameraDetail: 'جزئیات دوربین',
    add: 'افزودن',
    edit: 'ویرایش',
    save: 'ذخیره',
    cancel: 'انصراف',
    nameRequired: 'نام دوربین الزامی است',
    camUrlRequired: 'آدرس دوربین الزامی است',
    camUserRequired: 'نام کاربری دوربین الزامی است',
    camPasswordRequired: 'رمز عبور دوربین الزامی است',
    statusOptions: {
      active: 'فعال',
      inactive: 'غیرفعال',
      offline: 'آفلاین',
      online: 'آنلاین'
    }
  },

  //groups
  groups: {
    groups: 'گروه ها',
    title: 'مدیریت گروه‌ها',
    addGroup: 'افزودن گروه',
    editGroup: 'ویرایش گروه',
    deleteGroup: 'حذف گروه',
    confirmDelete: 'آیا از حذف این گروه اطمینان دارید؟',
    confirmDeleteMessage: 'آیا از حذف گروه "{name}" اطمینان دارید؟ این عملیات قابل بازگشت نیست.',
    id: 'شناسه',
    name: 'نام گروه',
    groupName: 'نام گروه',
    users: 'کاربران',
    createdAt: 'تاریخ ایجاد',
    updatedAt: 'تاریخ بروزرسانی',
    actions: 'عملیات',
    noData: 'هیچ گروهی یافت نشد',
    add: 'افزودن',
    save: 'ذخیره تغییرات',
    cancel: 'انصراف',
    edit: 'ویرایش',
    delete: 'حذف',
    itemsPerPage: 'تعداد در صفحه',
    sortBy: 'مرتب‌سازی بر اساس',
    sortOrder: 'ترتیب',
    ascending: 'صعودی',
    descending: 'نزولی',
    addNewGroup: 'افزودن گروه جدید',
    editGroupTitle: 'ویرایش گروه',
    addGroupTitle: 'افزودن گروه جدید',
    deleteConfirmation: 'تأیید حذف',
    loading: 'درحال بارگزاری گروه ها',
    noData: 'گروهی یافت نشد',

    // Permissions management
    permissions: 'دسترسی‌ها',
    assignedPermissions: 'دسترسی‌های تخصیص داده شده',
    permissionCategories: 'دسته‌بندی‌های دسترسی',
    permissionsTree: 'درخت دسترسی‌ها',
    noPermissionsAvailable: 'هیچ دسترسی‌ای موجود نیست',
    noPermissionsAssigned: 'هیچ دسترسی‌ای تخصیص داده نشده است',
    noUsersAssigned: 'هیچ کاربری تخصیص داده نشده است',
    groupDetails: 'جزئیات گروه',
    groupInfo: 'اطلاعات گروه',
    groupToDelete: 'گروه برای حذف',
    deleteWarning: 'این عملیات غیرقابل بازگشت است و تمام دسترسی‌های مرتبط با این گروه حذف خواهند شد.',

    // TreeView related translations
    treeView: {
      selectPermissions: 'انتخاب دسترسی‌ها',
      selectedPermissions: 'دسترسی‌ انتخاب شده',
      expandAll: 'باز کردن همه',
      collapseAll: 'بستن همه',
      searchPermissions: 'جستجو در دسترسی‌ها',
      noPermissionsFound: 'دسترسی‌ای یافت نشد',
      selectAll: 'انتخاب همه',
      deselectAll: 'لغو انتخاب همه',
      permissionCount: '{count} دسترسی انتخاب شده',
      categoryCount: '{count} دسته‌بندی',
      permissionDetails: 'جزئیات دسترسی',
      permissionName: 'نام دسترسی',
      permissionCode: 'کد دسترسی',
      permissionCategory: 'دسته‌بندی دسترسی'
    },

    // Sort fields
    sortFields: {
      id: 'شناسه',
      name: 'نام',
      createdAt: 'تاریخ ایجاد',
      updatedAt: 'تاریخ بروزرسانی'
    },

    // Sort orders
    sortOrders: {
      asc: 'صعودی',
      desc: 'نزولی'
    }
  },

  // Sidebar menu
  sidebar: {
    dashboard: 'داشبورد',
    profile: 'پروفایل',
    settings: 'تنظیمات',
    users: 'کاربران',
    products: 'محصولات',
    orders: 'سفارشات',
    analytics: 'تحلیل‌ها',
    notifications: 'اعلان‌ها',
    live: 'پخش زنده',
    access: 'اشخاص مجاز',
    reports: 'گزارش‌ها' // Added missing translation
  },

  // Navbar
  navbar: {
    search: 'جستجو...',
    notifications: 'اعلان‌ها',
    profile: 'پروفایل',
    logout: 'خروج',
    settings: 'تنظیمات'
  },

  // Profile page
  profile: {
    title: 'پروفایل',
    editProfile: 'ویرایش پروفایل',
    accountDetails: 'جزئیات حساب',
    fullName: 'نام کامل',
    username: 'نام کاربری',
    email: 'ایمیل',
    phone: 'تلفن',
    address: 'آدرس',
    bio: 'بیوگرافی',
    role: 'نقش',
    status: 'وضعیت',
    saveChanges: 'ذخیره تغییرات',

    // Security tab
    security: 'امنیت',
    changePassword: 'تغییر رمز عبور',
    currentPassword: 'رمز عبور فعلی',
    newPassword: 'رمز عبور جدید',
    confirmPassword: 'تأیید رمز عبور',

    // Status values
    active: 'فعال',
    inactive: 'غیرفعال',
    suspended: 'معلق',

    // Role values
    admin: 'مدیر',
    user: 'کاربر',
    editor: 'ویرایشگر',
    moderator: 'ناظر'
  },

  // Settings
  settings: {
    title: 'تنظیمات',
    appearance: 'ظاهر',
    language: 'زبان',
    notifications: 'اعلان‌ها',
    security: 'امنیت',
    theme: {
      theme: 'تم',
      light: 'روز',
      dark: 'شب',
      system: 'سیستم',
      mainColor: 'رنگ اصلی',
      theming: 'شخصی سازی تم',
      skin: 'پوسته',
      default: 'پیشفرض',
      bordered: 'حاشیه دار',
      layout: 'چیدمان',
      layouts: 'چیدمان ها',
      content: 'چینش محتوا',
      typeColor: 'رنگ را وارد کنید',
      layoutTypes: {
        vertical: 'عمودی',
        collapsed: 'جمع شده',
        horizontal: 'افقی',
        contents: {
          compact: 'کوچک',
          wide: 'عریض'
        }
      }
    }
  },

  //user dropdown
  userDropdown: {
    profile: 'پروفایل',
    settings: 'تنظیمات',
    themeSettings: 'تنظیمات ظاهر',
    logout: 'خروج'
  },

  // Authentication
  auth: {
    login: 'ورود',
    loggingIn: 'درحال ورود',
    register: 'ثبت نام',
    forgotPassword: 'فراموشی رمز عبور',
    resetPassword: 'بازنشانی رمز عبور',
    username: 'نام کاربری',
    password: 'رمز عبور',
    rememberMe: 'مرا به خاطر بسپار',
    dontHaveAccount: 'حساب کاربری ندارید؟',
    alreadyHaveAccount: 'قبلاً ثبت نام کرده‌اید؟',
    signIn: 'ورود',
    signUp: 'ثبت نام',
    signOut: 'خروج',
    pleaseSignIn: 'لطفاً برای استفاده از سامانه وارد شوید'
  },

  // Errors and messages
  messages: {
    success: 'عملیات با موفقیت انجام شد',
    error: 'خطایی رخ داده است',
    required: 'این فیلد الزامی است',
    invalidEmail: 'ایمیل نامعتبر است',
    passwordMismatch: 'رمزهای عبور مطابقت ندارند',
    passwordChanged: 'رمز عبور با موفقیت تغییر کرد',
    profileUpdated: 'پروفایل با موفقیت بروزرسانی شد',
    sessionExpired: 'جلسه شما منقضی شده است. لطفاً دوباره وارد شوید',
    networkError: 'خطای شبکه. لطفاً اتصال خود را بررسی کنید',
    error: 'خطایی رخ داده است'
  }
}

export default fa
