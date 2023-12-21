import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const darkModeAtom = atomWithStorage('darkMode', true)
export const sessionAtom = atom(null);
export const isPostSignUpCompleteAtom = atom(false);
export const isPostNameCompleteAtom = atom(false);
export const isPostUserCompleteAtom = atom(false);
export const allowSessionAtom = atom(false);
export const folderAtom = atom([]);
export const folderIdAtom = atom('');
export const fileNameAtom = atom('');
export const openMenuAtom = atom(false);
export const danswerItemAtom = atom('danswer');
export const showDanswerAtom = atom(false);
export const selectOptionAtom = atom([
    {
        name:'option_1',
        value:''
    },
    {
        name:'option_2',
        value:''
    },
    {
        name:'option_3',
        value:''
    },
    {
        name:'option_4',
        value:''
    }
]);