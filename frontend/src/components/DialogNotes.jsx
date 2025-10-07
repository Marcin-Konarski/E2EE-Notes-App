import React, { useState, useMemo } from 'react'
import { AlertTriangle, Search, Check } from 'lucide-react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropDownMenu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Alert, AlertDescription } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'


const DialogNotes = ({ isSharing, showDialog, setShowDialog, currentNote, handleOnClick, error, isPending, buttonText, buttonTextPending, usersList = [], onShare }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedUser, setSelectedUser] = useState(null)
    const [selectedPermission, setSelectedPermission] = useState('read')

    const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) {
        return []
    }

    const query = searchQuery.toLowerCase()
    return usersList.filter(user => 
        user.username.toLowerCase().startsWith(query)
    )
    }, [searchQuery, usersList])

    const handleShareClick = async () => {
    if (selectedUser && onShare) {
        await onShare(selectedUser, selectedPermission)
        setSearchQuery('')
        setSelectedUser(null)
        setSelectedPermission('read')
    }
    }

    const handleDialogClose = (open) => {
    setShowDialog(open)
    if (!open) {
        setSearchQuery('')
        setSelectedUser(null)
        setSelectedPermission('read')
    }
    }

    const getPermissionLabel = (permission) => {
    return permission.charAt(0).toUpperCase() + permission.slice(1)
    }

    if (isSharing) {
        return (
            <Dialog open={showDialog} onOpenChange={handleDialogClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Share Note</DialogTitle>
                        <DialogDescription>
                            Share "{currentNote?.title}" with other users by selecting their username and setting permissions.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="user-search">Search Users</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input id="user-search" placeholder="Type username..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
                            </div>
                        </div>

                        {searchQuery.trim() && (
                            <div className="max-h-48 overflow-y-auto space-y-1 rounded-md border p-2">
                                {filteredUsers.length > 0
                                    ? (filteredUsers.map((user) => (
                                            <div key={user.id} onClick={() => setSelectedUser(user)}
                                                className={`flex items-center justify-between rounded-sm px-3 py-2 cursor-pointer transition-colors hover:bg-accent ${selectedUser?.id === user.id ? 'bg-accent' : ''}`}>
                                            <span className="text-sm font-medium">{user.username}</span>
                                            {selectedUser?.id === user.id && (
                                                <Check className="size-4 text-primary" />
                                            )}
                                            </div>
                                        )))
                                    : (
                                    <div className="py-6 text-center text-sm text-muted-foreground">
                                        No users found
                                    </div>)
                                }
                            </div>
                        )}

                        {selectedUser && (
                            <div className="flex items-center justify-between rounded-md border p-3 bg-muted/50">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium">Selected User</p>
                                    <p className="text-sm text-muted-foreground">{selectedUser.username}</p>
                                </div>
                            
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm">
                                            {getPermissionLabel(selectedPermission)}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => setSelectedPermission('R')} className="cursor-pointer">
                                                <span className="flex items-center justify-between w-full">
                                                Read
                                                {selectedPermission === 'read' && <Check className="size-4" />}
                                                </span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSelectedPermission('W')} className="cursor-pointer">
                                                <span className="flex items-center justify-between w-full">
                                                Write
                                                {selectedPermission === 'write' && <Check className="size-4" />}
                                                </span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setSelectedPermission('S')} className="cursor-pointer">
                                                <span className="flex items-center justify-between w-full">
                                                Share
                                                {selectedPermission === 'share' && <Check className="size-4" />}
                                                </span>
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        )}

                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="size-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => handleDialogClose(false)} disabled={isPending} >
                            Cancel
                        </Button>
                        <Button onClick={handleShareClick} disabled={isPending || !selectedUser}>
                            {isPending ? 'Sharing...' : 'Share'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }

    return (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Note</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete "{currentNote?.title}"? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="size-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDialog(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleOnClick} disabled={isPending}>
                        {isPending ? buttonTextPending : buttonText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default DialogNotes