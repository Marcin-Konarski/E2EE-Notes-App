import { NavBarComponent } from '@/components/ui/NavBarComponent'
import { Book, Menu, Sunset, Trees, Zap, FilePlus} from "lucide-react";
import ArxLogo from '@/assets/logo.svg'

const NavBar = () => {

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
                icon: <Zap className="size-5 shrink-0" />,
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
            title: "Settings", // TODO: Here will be theme toggle!!
            url: "/settings",
        },
        {
            title: "Source Code",
            url: "https://github.com/Marcin-Konarski/Arx",
        },
    ]

    const auth = {
        login: {
            title: "Login",
            url: "/login"
        },
        signup: {
            title: "Sign Up",
            url: "/signup" 
        },
    }

    return (
        <NavBarComponent logo={logo} menu={menu} auth={auth} />
    )
}

export default NavBar