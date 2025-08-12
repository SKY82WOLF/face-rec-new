# راهنمای کامل مجوزها (Permissions) در پروژه

این مستند، جریان کامل مدیریت مجوزها در فرانت‌اند را توضیح می‌دهد: از دریافت «مجوزها و سایدبار» هنگام ورود تا ذخیره‌سازی، استفاده در ناوبری (منو)، محافظت از صفحات (PermissionGuard) و بررسی درون‌کامپوننتی (useHasPermission). همچنین تبدیل ساختار فلت API به درخت برای نمایش در صفحات گروه‌ها را پوشش می‌دهد.

---

## فهرست

- مروری سریع
- ذخیره‌سازی و استخراج مجوزها
- محافظ صفحه‌ها: `PermissionGuard`
- بررسی درون‌کامپوننتی: `useHasPermission`
- کش سایدبار و ساخت منوی عمودی
- ساخت درخت مجوزها برای گروه‌ها (TreeView)
- مسیرهای محافظت‌شده و سؤالات متداول
- فایل‌ها و کامپوننت‌های مرتبط

---

## مروری سریع

- پس از ورود موفق، بک‌اند «توکن‌ها + کاربر + سایدبار (شامل مجوزها)» را برمی‌گرداند.
- ما «سایدبار/مجوزها» را در ریداکس ذخیره و کدنیم‌ها را استخراج می‌کنیم؛ همچنین برای پایداری در `localStorage` نگه می‌داریم.
- `PermissionGuard` صفحات را براساس حضور توکن و داشتن کدنیم‌های لازم محافظت می‌کند.
- `useHasPermission` داخل هر کامپوننت برای شرطی‌سازی دکمه‌ها/بخش‌ها به‌کار می‌رود.
- دادهٔ «سایدبار» برای ساخت منوی عمودی به‌صورت کش با TTL (۶۰ ثانیه) نگهداری می‌شود.
- صفحات گروه‌ها از یک هوک استفاده می‌کنند تا پاسخ فلت API مجوزها را با استفاده از `sidebar_id` به ساختار درختی تبدیل کنند.

---

## ذخیره‌سازی و استخراج مجوزها

- فایل‌ها:
  - `src/hooks/useAuth.jsx`
  - `src/store/slices/permissionsSlice.js`
  - `src/store/index.js`

### جریان ورود (Login)

- در `useAuth.handleLogin` پس از دریافت پاسخ لاگین:
  - توکن‌ها و کاربر در `localStorage` ذخیره می‌شوند.
  - `results.sidebar` (سایدبار شامل دسته‌ها و مجوزهای هر دسته) به اکشن `setPermissions` ارسال می‌شود تا در ریداکس ذخیره گردد.

### اسلایس مجوزها (`permissionsSlice`)

- حالت (state):
  - `original`: همان آرایهٔ سایدبارِ دریافتی از بک‌اند (دسته‌ها + مجوزهای هر دسته)
  - `codenames`: لیست یکتای کدنیم‌ها، استخراج‌شده از `original`
  - `loading`: وضعیت بارگذاری
- سلکتورها:
  - `selectPermissionsCodenames`
  - `selectPermissionsLoading`
  - `selectSidebar` (خود سایدبار ذخیره‌شده)

### پایداری در `localStorage`

- در `src/store/index.js` با `preloadedState`، بخش مجوزها از `localStorage` بازیابی می‌شود.
- با `store.subscribe` هر تغییر در `permissions.original` دوباره در `localStorage` ذخیره می‌شود.

---

## محافظ صفحه‌ها: `PermissionGuard`

- فایل: `src/utils/PermissionGuard.jsx`
- رفتار:
  - در هر رندر بررسی می‌کند آیا هرکدام از توکن‌های `access_token` یا `refresh_token` در `localStorage` وجود دارد یا نه.
  - اگر توکنی وجود نداشته باشد، به `/login` هدایت کرده و چیزی رندر نمی‌کند (از بروز 404 بعد از خروج جلوگیری می‌کند).
  - تا وقتی که `permissions` در حال بارگذاری است، `LoadingState` نمایش داده می‌شود.
  - پس از اطمینان از احراز هویت، بررسی می‌کند آیا کاربر تمام کدنیم‌های موردنیاز برای آن صفحه را دارد یا خیر. در غیر این صورت:
    - اگر `fallback` داده شده باشد همان را رندر می‌کند؛
    - وگرنه به `/404` هدایت می‌کند.

### نمونهٔ استفاده

```jsx
// src/app/(dashboard)/users/page.jsx
export default function UsersPage() {
  return (
    <PermissionGuard permission='listUsers'>
      <Users />
    </PermissionGuard>
  )
}
```

- برای چند مجوز:

```jsx
<PermissionGuard permission={['addUser', 'updateUser']}>
  <SomeComponent />
</PermissionGuard>
```

نکته: صفحهٔ لاگین داخل `(blank-layout-pages)` است و با گارد پوشش داده نمی‌شود.

---

## بررسی درون‌کامپوننتی: `useHasPermission`

- فایل: `src/utils/HasPermission.jsx`
- رفتار: لیست کدنیم‌های کاربر را از ریداکس می‌خواند و بررسی می‌کند آیا یک کدنیم یا همهٔ کدنیم‌های یک آرایه را دارد.

### نمونهٔ استفاده

```jsx
const hasUpdate = useHasPermission('updateUser')
const canManage = useHasPermission(['addUser', 'deleteUser'])

<Button disabled={!hasUpdate}>ویرایش</Button>
{canManage && <AdminPanel />}
```

---

## کش سایدبار و ساخت منوی عمودی

- فایل‌ها:
  - `src/hooks/useSidebar.jsx`
  - `src/data/navigation/verticalMenuData.jsx`

### `useSidebar` (کش با TTL)

- دادهٔ سایدبار از API `/sidebar` با TanStack Query دریافت می‌شود.
- در `localStorage` با کلید `sidebar_nav` و ساختار `{ ts, data }` ذخیره می‌شود.
- TTL: ۶۰ ثانیه. پس از انقضا به‌صورت خودکار حذف می‌شود و درخواست مجدد انجام می‌گیرد.
- Query همیشه فعال است (قابل `refetch` حتی با وجود کش).

### `useVerticalMenuData`

- منو را با ترکیب «سایدبار کش شده» و «کدنیم‌های کاربر» می‌سازد:
  - فقط آیتم‌هایی که `href` غیرخالی دارند و حداقل یکی از مجوزهای آن دسته در کدنیم‌های کاربر موجود است نشان داده می‌شوند.
  - برای جلوگیری از خطای Hydration، آیتم‌های داینامیک بعد از `mounted` شدن کلاینت رندر می‌شوند؛ «Live» و «Profile» همیشه نمایش داده می‌شوند.

---

## ساخت درخت مجوزها برای گروه‌ها (TreeView)

- فایل‌ها:
  - `src/hooks/usePermissions.jsx`
  - `src/views/Groups/TreeView.jsx`
  - `src/views/Groups/GroupsAddModal.jsx`
  - `src/views/Groups/GroupsUpdateModal.jsx`
  - `src/views/Groups/GroupDetail.jsx`

### ورودی جدید API مجوزها (فلت)

- پاسخ جدید `/permissions` فلت است و شامل فیلد `sidebar_id` برای هر مجوز.

### تبدیل به ساختار درختی

- `usePermissions` مجوزهای فلت را با `sidebar_id` گروه‌بندی و یک لیست تخت برای TreeView می‌سازد:
  - نود دسته: `id = cat-<sidebar_id>` و `isCategory = true`
  - نود مجوز: `id = perm-<id>` و `parent_id = cat-<sidebar_id>`
  - عنوان دسته از `sidebar` ذخیره‌شده در ریداکس (از لاگین/کش) خوانده می‌شود.

### TreeView

- `TreeView.jsx` با `MUI RichTreeView` کار می‌کند و انتخاب چندگانه دارد.
- برای ثبات، تمام `id`ها رشته‌ای هستند. پراپ `selected` هنوز آرایهٔ ID عددی مجوزها می‌گیرد و داخل TreeView به `perm-<id>` نگاشت می‌شود؛ خروجی onChange به اعداد بازگردانده می‌شود.

### ادغام در صفحات گروه‌ها

- `GroupsAddModal` و `GroupsUpdateModal`: انتخاب مجوزها برحسب ID عددی است (نگاشت در TreeView انجام می‌شود).
- `GroupDetail`: برای نمایش درخت فقط مجوزهای گروه + دسته‌های والد را فیلتر می‌کند (شناسه‌های والد با `cat-<id>` همسان‌سازی شده‌اند).

---

## مسیرهای محافظت‌شده و نکات

- صفحات محافظت‌شده نمونه:
  - `src/app/(dashboard)/live/page.jsx` → `listTypes`
  - `src/app/(dashboard)/access/page.jsx` → `listPersons`
  - `src/app/(dashboard)/report/page.jsx` → `listPersonReports`
  - `src/app/(dashboard)/users/page.jsx` → `listUsers`
  - `src/app/(dashboard)/profile/page.jsx` → `getUser`

### جلوگیری از 404 بعد از خروج

- بعد از خروج، `PermissionGuard` اکنون در هر رندر وجود/عدم وجود توکن‌ها را بررسی می‌کند و در صورت عدم احراز هویت به `/login` هدایت کرده و چیزی رندر نمی‌کند؛ سپس فقط در حالت احراز هویت، بررسی مجوز انجام می‌شود.

### افزودن صفحهٔ عمومی

- صفحات عمومی (مثل لاگین) را بدون `PermissionGuard` رندر کنید.

### افزودن صفحهٔ محافظت‌شده جدید

1. مجوز لازم را مشخص کنید (کدنیم).
2. صفحه را در `app/(dashboard)/.../page.jsx` داخل `PermissionGuard` با پراپ `permission` بپیچید.

---

## فایل‌ها و کامپوننت‌های مرتبط

- گارد مجوز: `src/utils/PermissionGuard.jsx`
- هوک بررسی مجوز: `src/utils/HasPermission.jsx`
- ذخیره/استخراج مجوزها در ریداکس: `src/store/slices/permissionsSlice.js`
- تنظیم Store و پایداری در localStorage: `src/store/index.js`
- جریان ورود/خروج: `src/hooks/useAuth.jsx`
- کش سایدبار با TTL و Query: `src/hooks/useSidebar.jsx`
- ساخت منوی عمودی از سایدبار و مجوزها: `src/data/navigation/verticalMenuData.jsx`
- ساخت درخت مجوزها برای گروه‌ها: `src/hooks/usePermissions.jsx`, `src/views/Groups/TreeView.jsx`
- صفحات نمونهٔ محافظت‌شده:
  - `src/app/(dashboard)/live/page.jsx`
  - `src/app/(dashboard)/access/page.jsx`
  - `src/app/(dashboard)/report/page.jsx`
  - `src/app/(dashboard)/users/page.jsx`
  - `src/app/(dashboard)/profile/page.jsx`

---

## نکات پایانی

- منوی عمودی پس از `mounted` شدن، آیتم‌های داینامیک را رندر می‌کند تا از خطای Hydration جلوگیری شود.
- TTL کش سایدبار ۶۰ ثانیه است؛ `refetchSidebar` همیشه در دسترس است.
- برای تغییر ساختار سایدبار/مجوزها در بک‌اند، فقط کافی است پاسخ `login` و `/sidebar` را مطابق قرارداد فعلی بازگردانید؛ فرانت‌اند به‌صورت خودکار همسان می‌شود.
