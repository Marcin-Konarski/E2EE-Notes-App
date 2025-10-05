import { useEffect, useLayoutEffect, useState } from "react";
import { Book, Sunset, Trees, Key, FilePlus, Settings, LogOut} from "lucide-react";

import ArxLogo from '@/assets/logo.svg'
import { NavBarComponent } from '@/components/NavBar/NavBarComponent'
import { useUserContext } from '@/hooks/useUserContext';
import { useNotesContext } from "@/hooks/useNotesContext";
import useNotes from "@/hooks/useNotes";
import { useNavigate } from "react-router-dom";


const NavBar = () => {
    const navigate = useNavigate();
    const { user, logout } = useUserContext();
    const { currentNoteId, setCurrentNoteId, storageNoteIdKey } = useNotesContext();
    const [notesNavBar, setNotesNavBar] = useState({ title: "Notes", url: "/notes", });
    const { createNote } = useNotes();

    const handleNewNoteCreation = async () => {
        const status = await createNote({title: 'New Note', body: ''});
        if (status.success) {
            console.log(status.data);
            navigate(`/notes/${status.data.id}`);
        } else {
            console.log(status.error);
        }
    }

    useLayoutEffect(() => {
        const savedNoteId = localStorage.getItem(storageNoteIdKey);
        if (savedNoteId) {
            setCurrentNoteId(savedNoteId);
        }
    }, []);

    useEffect(() => {
        if (user) {
            setNotesNavBar(c => ({...c, items: [
                    {
                        title: "New Note",
                        // description: "Create new note",
                        icon: <FilePlus className="size-5 shrink-0" />,
                        url: "/notes/new",
                        isButton: true,
                        function: handleNewNoteCreation,
                    },
                    {
                        title: "Edit Notes",
                        // description: "Edit last note",
                        icon: <Book className="size-5 shrink-0" />,
                        url: currentNoteId ? `/notes/${currentNoteId}` : "/notes",
                    },
                ],
            }))
        } else {
            setNotesNavBar(({items, ...c}) => c) // Remove `items` from notesNavBar
        }
    }, [user, currentNoteId]); // Update navbar also when currentNoteId changes


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
        notesNavBar,
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
                    description: "ble ble",
                    icon: <Sunset className="size-5 shrink-0" />,
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
            variant: "default"
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
                    titleMobile: user.username,
                    icon: <Settings className="size-5 shrink-0" />,
                    url: "/profile",
                    variant: "default"
                },
                {
                    title: "Logout",
                    titleMobile: "Logout",
                    icon: <LogOut className="size-5 shrink-0" />,
                    url: "/login",
                    isButton: true,
                    function: logout,
                    variant: "outline"
                },
            ],
        }
    ];

    return (
        <NavBarComponent logo={logo} menu={menu} authButtons={authUser || authAnonymous} />
    );
}

export default NavBar