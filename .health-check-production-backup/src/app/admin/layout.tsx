'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminId');
    localStorage.removeItem('username');
    
    // 清除cookie
    document.cookie = 'adminToken=; path=/; max-age=0';
    
    router.push('/admin/login');
  };

  const menuItems = [
    { href: '/admin/dashboard', label: '控制台首页' },
    { href: '/admin/user/list', label: '用户管理' },
    { href: '/admin/profile', label: '个人中心' },
    { href: '/admin/profile/change-password', label: '修改密码' },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* 左侧菜单 */}
      <aside className="w-full md:w-64 bg-gray-900 text-white">
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">健康自检管理后台</h1>
        </div>
        <nav className="mt-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-3 hover:bg-gray-700 transition-colors ${
                pathname === item.href ? 'bg-gray-700 border-l-4 border-blue-500' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">管理后台</h2>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            退出登录
          </button>
        </header>

        {/* 内容 */}
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
