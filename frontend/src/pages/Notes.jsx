import { memo, useCallback, useState } from "react";
import { Outlet } from "react-router-dom";

import useAuth from "@/hooks/useAuth";
import { useUserContext } from "@/hooks/useUserContext";
import { useNotesContext } from "@/hooks/useNotesContext";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/Resizable"
import { PasswordInput } from '@/components/ui/PasswordInput';
import NotesList from "@/components/NotesList";
import EditorAnonymous from "@/pages/EditorAnonymous";
import { Button } from "@/components/ui/Button";


const RightPanel = memo(({ unlocked, setUnlocked }) => {
  const { notes } = useNotesContext();
  const { userKeys } = useUserContext();
  const { manageNotesDecryption, manageKeysOnLogin } = useAuth();
  const [password, setPassword] = useState('');
  const [decrypting, setDecrypting] = useState(false);
  const [error, setError] = useState(null);

  const isLocked = !unlocked && !userKeys?.current?.userWrappingKey;

  const onSubmitDecrypt = useCallback(async (e) => {
    e?.preventDefault();
    setError(null);

    if (!password) {
      setError('Password is required');
      return;
    }

    console.log(userKeys.current.responsePublicKey, userKeys.current.responsePrivateKey, userKeys.current.responseSalt)
    await manageKeysOnLogin(password, userKeys.current.responsePublicKey, userKeys.current.responsePrivateKey, userKeys.current.responseSalt)
    await manageNotesDecryption(notes);

  }, [password, manageKeysOnLogin, setUnlocked]);

  if (!isLocked) {
    return <Outlet />;
  }

  return (
    <>
      {/* viewport-level backdrop (does not block NavBar if NavBar z-index > 40) */}
      <div className="fixed inset-0 bg-black/20 z-40 pointer-events-none" />

      {/* centered, fixed card in the middle of the screen */}
      <div className="fixed left-1/2 top-1/2 z-40 w-full max-w-md p-6 -translate-x-1/2 -translate-y-1/2
                      bg-secondary/60 rounded-lg shadow-xl pointer-events-auto text-sm">
          <div className="mb-3 font-medium">Please provide your password to decrypt your notes</div>

          <form onSubmit={onSubmitDecrypt} className="space-y-4 mt-2">
            <PasswordInput placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error && <div className="text-sm text-red-500">{error}</div>}

            <div className="flex justify-end">
              <Button type="submit" disabled={decrypting || !password}>
                {decrypting ? 'Decrypting...' : 'Decrypt'}
              </Button>
            </div>
          </form>
      </div>
    </>
  );
});


const Notes = memo(() => {
  const { notes } = useNotesContext();
  const { user, userKeys } = useUserContext();
  const [unlocked, setUnlocked] = useState(!!userKeys?.current?.userWrappingKey);

  if (!user) {
    return <EditorAnonymous />
  }

  return (<>
    {/* Mobile Layout */}
    <div className='flex-1 h-full w-full overflow-hidden lg:hidden'>
      <Outlet />
    </div>

    {/* Desktop Layout */}
    <div className="hidden lg:block h-full w-full">
      <ResizablePanelGroup direction="horizontal" className="w-full h-full border-t">
        <ResizablePanel defaultSize={16} minSize={16} maxSize={56} className='min-w-72'>
          <div className="flex w-full h-full items-start justify-start p-4">
            <div className='flex flex-col w-full gap-2'>
              <NotesList notesList={notes} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={84}>
          <RightPanel unlocked={unlocked} setUnlocked={setUnlocked} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  </>);
});

export default Notes