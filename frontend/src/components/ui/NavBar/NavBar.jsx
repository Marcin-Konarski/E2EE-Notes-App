import { Book, Sunset, Trees, Key, FilePlus, Settings, LogOut} from "lucide-react";

import ArxLogo from '@/assets/logo.svg'
import { NavBarComponent } from '@/components/ui/NavBar/NavBarComponent'
import { useUserContext } from '@/hooks/useUserContext';


const NavBar = () => {
    const { user, logout } = useUserContext();

    const logo = {
        url: "/",
        src: ArxLogo,
        alt: "logo",
        size: 10
    }

    const menu = [
        {
            title: "Home",
            url: "/"
        },
        {
            title: "Notes",
            url: "/notes",
            items: [
                {
                title: "New",
                description: "Create new note",
                icon: <FilePlus className="size-5 shrink-0" />,
                url: "/notes",
                },
                {
                title: "List",
                description: "View my notes",
                icon: <Book className="size-5 shrink-0" />,
                url: "/notes",
                },
            ],
        },
        {
            title: "Ecnryption",
            url: "/keys",
            items: [
                {
                title: "My keys",
                description: "View your private key",
                icon: <Key className="size-5 shrink-0 mt-1" />,
                url: "/keys",
                },
                {
                title: "Ala ma kota",
                description: "I dwa psy",
                icon: <Sunset className="size-5 shrink-0" />,
                url: "/keys",
                },
                {
                title: "Chciała by mieć rybkę",
                description: "Ale jej rodzice nie pozwalają",
                icon: <Trees className="size-5 shrink-0" />,
                url: "/keys",
                },
                {
                title: "A jak jej już pozwolili",
                description: "To kiedyś przychodzi do domu a rybka puff zniknęła",
                icon: <Book className="size-5 shrink-0" />,
                url: "/keys",
                },
            ],
        },
        {
            title: "Source Code",
            url: "https://github.com/Marcin-Konarski/Arx",
        },
    ]

    const authAnonymous = [
        {
            title: "Login",
            url: "/login",
            variant: "outline"
        },
        {
            title: "Sign Up",
            url: "/signup",
            variant: "outline"
        },
    ];

    const authUser = user && [
        {
            title: user.username,
            url: "/profile",
            items: [
                {
                title: "Settings",
                icon: <Settings className="size-5 shrink-0" />,
                url: "/profile",
                },
                {
                title: "Log out",
                icon: <LogOut className="size-5 shrink-0" />,
                url: "/login",
                isLogOut: true,
                function: logout,
                },
            ],
        }
    ];

    return (
        <NavBarComponent logo={logo} menu={menu} authButtons={authUser || authAnonymous} />
    );
}

export default NavBar