import React from 'react'
import { EllipsisVertical, SquarePen, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from './ui/DropDownMenu'

const NotesDropdownMenu = ({ currentNote }) => {

    const handleRename = (currentNote) => {

    }

    const handleDelete = (currentNote) => {

    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button className='p-0 m-0 size-7 rounded-2xl hover:!bg-transparent hover:!text-inherit' variant='ghost'>
                        <EllipsisVertical className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">

                <DropdownMenuGroup>
                    <DropdownMenuItem className='w-full justify-between' asChild>
                        <Button variant="ghost" ring={false} className="w-full h-full justify-between" onClick={handleRename}>Rename<SquarePen /></Button>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Button variant="ghost" ring={false} className="w-full h-full justify-between text-destructive" onClick={handleDelete}>Delete<Trash2 /></Button>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default NotesDropdownMenu