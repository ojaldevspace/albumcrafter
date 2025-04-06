const navigation = [
    { name: 'Dashboard', href: '/about', current: true },
    { name: 'Team', href: '#', current: false },
    { name: 'Projects', href: '#', current: false },
    { name: 'Calendar', href: '#', current: false },
  ]


export default function Navigation(){
    return(
        <div className="flex space-x-4">
            {navigation.map((item) => (
            <a
                key={item.name}
                href={item.href}
                aria-current={item.current ? 'page' : undefined}
            >
                {item.name}
            </a>
            ))}
        </div>
    );
}