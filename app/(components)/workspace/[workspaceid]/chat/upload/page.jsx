'use client'
import React, { useState, useEffect } from 'react'
import { useAtom } from 'jotai';
import uploadIcon from '../../../../../../public/assets/upload-cloud.svg'
import { Label } from '../../../../../../components/ui/label';
import { Input } from '../../../../../../components/ui/input';
import Image from 'next/image';
import { useDropzone } from 'react-dropzone';
import { folderAtom, folderIdAtom, userConnectorsAtom, documentSetAtom } from '../../../../../store';
import { useToast } from '../../../../../../components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Loader, Loader2, X } from 'lucide-react';
import { Button } from '../../../../../../components/ui/button';
import { cn } from '../../../../../../lib/utils';
import { Dialog, DialogTrigger, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../../../../../../components/ui/dialog'
import { useParams } from 'next/navigation'

const Upload = () => {

  const [loading, setLoading] = useState(true);
  const [d_open, setD_open] = useState(false)
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [folder, setFolder] = useAtom(folderAtom);
  const [folderId, setFolderId] = useAtom(folderIdAtom);
  const [documentSet, setDocumentSet] = useState([]);
  // const [documentSet, setDocumentSet] = useAtom(documentSetAtom);
  const [dialogLoader, setDialogLoader] = useState(false);

  const [currentDOC, setCurrentDoc] = useState([]);
  const [userConnectors, setUserConnectors] = useAtom(userConnectorsAtom);
  const [existConnector, setExistConnector] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState([]);
  const router = useRouter()
  const [context, setContext] = useState({
    contextName: '',
    fileName: '',
    description: ''
  })
  const { toast } = useToast();


  const { workspaceid, chatid } = useParams()


  const onDrop = (acceptedFiles) => {

    if (acceptedFiles && acceptedFiles.length > 0) {

      acceptedFiles?.map((file) => {
        setFiles((prev) => [...prev, file])
      })
    }
  };

  async function uploadFile(files) {
    if (documentSet?.length === 0 && context.contextName === '') {
      return toast({
        variant: 'destructive',
        title: "Give your context a name first!"
      });
    }
    if (context.fileName === '') {
      return toast({
        variant: 'destructive',
        title: "Write a valid name for files identification!"
      });
    }
    setUploading(true)
    try {
      const formData = new FormData();
      let isZip = false
      files?.forEach((file) => {
        if (file.type === "application/zip") {
          setUploading(false)
          isZip = true
          return toast({
            variant: 'destructive',
            title: "Zip File Not Allowed"
          });
        }
        formData.append("files", file);
      });

      if (isZip) {

        return null
      }

      const data = await fetch(`/api/manage/admin/connector/file/upload`, {
        method: "POST",
        body: formData
      });
      if (data.ok) {
        const json = await data.json();

        await connectorRequest(json.file_paths)
      } else {
        console.log(data)
      }
    } catch (error) {
      console.log('error in upload', error)
      setUploading(false)
      return toast({
        variant: 'destructive',
        title: "Some error occured!!"
      });

    }
  };

  async function connectorRequest(path) {
    try {
      const data = await fetch(`/api/manage/admin/connector`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "name": "FileConnector-" + Date.now(),
          "source": "file",
          "input_type": "load_state",
          "connector_specific_config": {
            "file_locations": path
          },
          "refresh_freq": null,
          "disabled": false
        })
      }

      );
      const json = await data?.json();


      // if (existConnector?.length === 0) {

      //   await insertDataInConTable([json?.id])
      // } else {

      //   await updatetDataInConTable(existConnector, json?.id)
      // }

      await getCredentials(json?.id)
    } catch (error) {
      console.log('error while connectorRequest :', error)
      setUploading(false)
      return toast({
        variant: 'destructive',
        title: "Some error occured!!"
      });
    }
  };

  async function getCredentials(connectID) {
    try {
      const data = await fetch(`/api/manage/credential`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({
          "credential_json": {},
          "admin_public": true
        })
      });
      const json = await data?.json();
      // console.log('getCredentials done', json)
      await sendURL(connectID, json?.id)
    } catch (error) {
      console.log('error while getCredentials:', error)
      setUploading(false)
      return toast({
        variant: 'destructive',
        title: "Some error occured!!"
      });
    }
  };

  async function sendURL(connectID, credID) {
    try {
      const data = await fetch(`/api/manage/connector/${connectID}/credential/${credID}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",

        },
        body: JSON.stringify({ 'name': context.fileName })
      });
      const json = await data?.json();

      await runOnce(connectID, credID);
      setCurrentDoc(json.data);
      setTimeout(async () => {
        if (documentSet.length === 0) {
          await setDocumentSetInServer(connectID, context.contextName, context);
        } else {
          await updateDocumentSetInServer(documentSet[0]?.id, connectID, context)
        }
      }, 2000)

    } catch (error) {
      console.log('error while sendURL:', error)
      setUploading(false)
      return toast({
        variant: 'destructive',
        title: "Some error occured!!"
      });
    }
  };

  async function runOnce(conID, credID) {
    try {
      const data = await fetch(`/api/manage/admin/connector/run-once`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "connector_id": conID,
          "credentialIds": [
            credID
          ]
        })
      });
      const json = await data.json()
      // console.log('run once done', json);

    } catch (error) {
      console.log('error in runOnce :', error)
      setUploading(false)
      return toast({
        variant: 'destructive',
        title: "Some error occured!!"
      });
    }
  };

  async function setDocumentSetInServer(ccID, set_name) {

    const data = await fetch(`/api/manage/admin/connector/indexing-status`);
    const json = await data.json();

    const docSetid = []

    for (const pair_id of json) {
      if (pair_id?.connector?.id === ccID) {
        docSetid.push(pair_id?.cc_pair_id);

      }
    };
    if (docSetid.length === 0) {
      return null
    }

    try {

      const res = await fetch(`/api/manage/admin/document-set`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "folder_id": folderId,
          "name": `${set_name}`,
          "description": context.description,
          "cc_pair_ids": docSetid
        })
      });

      const id = await res.json();

      if (id) {

        toast({
          variant: 'default',
          title: "File uploaded!"
        });
        router.push(`/workspace/${workspaceid}/chat/new`)
        setD_open(false)
        setDialogLoader(false)
      } else {
        return toast({
          variant: 'destructive',
          title: "Some error occured!!"
        })
      }

    } catch (error) {
      console.log(error);
      toast({
        variant: 'destructive',
        title: "Some error occured!!"
      });
    }
  }

  async function updateDocumentSetInServer(db_id, ccID, con) {

    const data = await fetch(`/api/manage/admin/connector/indexing-status`);
    const json = await data.json();

    const docSetid = documentSet[0].cc_pair_descriptors.map(item => item.id)
    for (const pair_id of json) {
      if (pair_id?.connector?.id === ccID) {
        docSetid.push(pair_id?.cc_pair_id);
      }
    };
    

    try {
      const res = await fetch(`/api/manage/admin/document-set`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "folder_id":folderId,
          "id": db_id,
          "description": con.description,
          "cc_pair_ids": docSetid
        })
      });
      setContext({ fileName: '', description: '', contextName: '' })
      toast({
        variant: 'default',
        title: "File uploaded!"
      });
      router.push(`/workspace/${workspaceid}/chat/new`)
    } catch (error) {
      console.log(error)
    }
  }

  async function setDocumentSetInServer2(ccID, context) {
    if(context.contextName === ''){
      return toast({
            variant: 'destructive',
            title: "Please write context name"
          })
    }
    console.log(ccID, folderId);
    
    setDialogLoader(true)
    try {
      const res = await fetch(`/api/manage/admin/document-set`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "folder_id":folderId,
          "name": context.contextName,
          "description": context.description,
          "cc_pair_ids": ccID
        })
      });

      const id = await res.json();

      if (id) {
        toast({
          variant: 'default',
          title: "File uploaded!"
        });
        setContext({ fileName: '', contextName: '', description: '' })
        router.push(`/workspace/${workspaceid}/chat/new`)
        setD_open(false)
        setDialogLoader(false)
      } else {
        return toast({
          variant: 'destructive',
          title: "Some error occured!!"
        })
      }

    } catch (error) {
      console.log(error);
      toast({
        variant: 'destructive',
        title: "Some error occured!!"
      });
    }
  }

  async function updateDocumentSetInServer2(db_id, ccID, c_name) {
    try {
      const res = await fetch(`/api/manage/admin/document-set`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "folder_id":folderId,
          "id": db_id,
          "description": context.description,
          "cc_pair_ids": ccID
        })
      });

      setContext({ fileName: '', description: '', contextName: '' })
      toast({
        variant: 'default',
        title: "File uploaded!"
      });
      router.push(`/workspace/${workspaceid}/chat/new`)

    } catch (error) {
      console.log(error)
    }
  }

  function handleDocSetID(id) {
    //console.log(id)
    if (selectedDoc?.includes(parseInt(id))) {
      // const idx = selectedDoc.indexOf(id);
      setSelectedDoc(selectedDoc?.filter(doc => doc !== parseInt(id)))
    } else {
      setSelectedDoc((prev) => [...prev, parseInt(id)])

    }
    // console.log(selectedDoc)

  }

  async function uploadDocSetFiles() {

    if (selectedDoc?.length === 0) {
      return toast({
        variant: 'destructive',
        title: "Please select atleast one file!"
      })
    };
    
    // console.log(selectedDoc);
    
    if (documentSet?.length === 0) {
      await setDocumentSetInServer2(selectedDoc, context);
    } else {
      await updateDocumentSetInServer2(documentSet[0]?.id, selectedDoc)
    }
  };

  async function getDocSetDetails(folder_id) {
    if (!folder_id) {
      setLoading(false);
      return null
    }
    const res = await fetch(`/api/manage/document-set-v2/${folder_id}`)
    if (res.ok) {
      const data = await res.json();
      console.log(data)
      //console.log(data[0].cc_pair_descriptors.map(item => item.id))
      if (data.length > 0) {
        setDocumentSet(data)
      } else {
        setDocumentSet([])
        // router.push(`/workspace/${workspaceid}/chat/upload`)
      }
      
    };
    setLoading(false)
  };



  async function indexingAll() {
    const data = await fetch(`/api/manage/admin/connector/indexing-status`);
    const json = await data.json();
    console.log(json)
  }
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  useEffect(() => {
    // indexingAll()
    if (folder === null || folder?.length === 0) {
      // router.push('/chat/new')
    }
    // else {
    //   setLoading(false)
    // }

  }, [folder]);

  useEffect(() => {
    getDocSetDetails(folderId)

  }, [folderId]);


  useEffect(() => {

    if (userConnectors !== null) {
      // const fileData = userConnectors?.filter((item) => item?.connector?.source === 'file');
      const conn_ids = userConnectors?.map(conn => { return conn?.connector?.id });
      // console.log(conn_ids)
      setExistConnector(conn_ids);


      // if (fileData?.length > 0) {
      //   const conn_ids = userConnectors?.map(conn => { return conn?.connector?.id });
      //   setExistConnector(conn_ids);
      // };
    }
  }, [userConnectors]);

  if (loading) {
    return (
      <div className='flex w-full justify-center items-center h-screen'>
        <Loader2 className='animate-spin' />
      </div>
    )
  };


  return (
    <div className='w-full flex flex-col justify-center items-center rounded-[6px] gap-5 sticky top-0 self-start p-10 min-h-screen'>
      {uploading ?
        <div className={`w-[70%] border flex flex-col justify-center items-center bg-[#EFF5F5] h-48 gap-4`}>
          <Loader className='animate-spin' />
          <p className='font-[500] text-sm leading-5 animate-pulse'>Please wait... We are processing your document.</p>
        </div>
        :
        <div className='w-[70%] p-5 flex flex-col justify-center items-center gap-2 rounded-md shadow-black shadow-sm'>
          {documentSet?.length === 0 &&
            <div>
              <p className='font-[600] text-[20px] tracking-[.25%] text-[#0F172A] opacity-[50%] leading-7'>This folder is empty</p>
              <p className='font-[400] text-sm tracking-[.25%] text-[#0F172A] opacity-[50%] leading-8'>Upload a document to start</p>
            </div>}
          {documentSet?.length === 0 ?
            <div className='w-full text-start space-y-2 '>

              <div>
                <Label className='text-start' htmlFor='context'>Name of Context</Label>
                <Input type='text' placeholder='Name should be unique' id='context' value={context.contextName} onChange={(e) => setContext({ ...context, 'contextName': e.target.value })} />
              </div>
              <div>
                <Label className='text-start' htmlFor='context'>File Name</Label>
                <Input type='text' placeholder='Write a name to identify your files' id='context' value={context.fileName} onChange={(e) => setContext({ ...context, 'fileName': e.target.value })} />
              </div>
              <div>
                <Label className='text-start' htmlFor='context'>Description</Label>
                <Input type='text' placeholder='Write a short description' id='context' value={context?.description} onChange={(e) => setContext({ ...context, description: e.target.value })} />
              </div>
            </div> :
            <div className='w-full text-start space-y-2 mb-2'>

              <Label className='text-start' htmlFor='context'>File Name</Label>
              <Input type='text' placeholder='Write a name to identify your files' id='context' value={context.fileName} onChange={(e) => setContext({ ...context, 'fileName': e.target.value })} />

            </div>
          }

          {files.length === 0 ?
            <>
              <div
                className={`w-full border rounded-md flex flex-col justify-center items-center bg-[#EFF5F5] py-5 ${isDragActive ? 'opacity-50' : ''} shadow-md`}
                {...getRootProps()}
              >
                <input {...getInputProps()} multiple accept=".pdf, .txt, .md, .mdx, .docx, .doc" required />

                <Image src={uploadIcon} alt='upload' />
                <div className='w-full text-center'>
                  <p className='font-[400] leading-6 text-[15px] opacity-[80%]'>Click to upload or drag and drop</p>
                  <p className='opacity-[50%] text-sm leading-6'>PDF & TXT</p>
                </div>
              </div>
              {userConnectors?.length > 0 &&
                <div className='w-full text-sm leading-5 text-center space-y-2'>
                  <p className='font-[500]'>OR</p>
                  <Dialog open={d_open} onOpenChange={() => { setSelectedDoc(documentSet[0]?.cc_pair_descriptors?.length > 0 ? documentSet[0]?.cc_pair_descriptors.map(cc => cc.id) : []); setD_open(!d_open) }} className='fixed max-h-52 overflow-x-scroll no-scrollbar' >
                    <DialogTrigger asChild>
                      <p className='font-[600] p-2 border w-[70%] m-auto rounded-sm shadow-sm bg-[#EFF5F5] hover:cursor-pointer' onClick={() => setD_open(true)}>Select from existing files</p>
                    </DialogTrigger>
                    <DialogContent>
                      {!dialogLoader ?
                        <>
                          <h1 className='font-[600] text-sm leading-5 m-2'>Select Documents</h1>
                          {documentSet?.length === 0 && <div>
                            <Label className='text-start' htmlFor='context'>Name of Context</Label>
                            <Input type='text' placeholder='Name Should Be Unique' id='context' value={context.contextName} onChange={(e) => setContext({ ...context, 'contextName': e.target.value })} />
                          </div>}
                          <div className='flex gap-2 flex-wrap'>
                            {userConnectors?.map((connector) =>
                              <div className='space-x-2 p-1 border flex items-center rounded-sm hover:bg-slate-100 w-fit break-all' key={connector?.cc_pair_id}>
                                <input type="checkbox" value={connector?.cc_pair_id} checked={selectedDoc?.includes(connector?.cc_pair_id)} id={connector?.cc_pair_id} className={`px-2 py-1 border rounded hover:cursor-pointer hover:bg-gray-100 `} onChange={(e) => handleDocSetID(e.target.value)} /><label htmlFor={connector?.cc_pair_id} >{connector?.name}</label></div>)
                            }
                          </div>
                          <DialogFooter className={cn('w-full')}>
                            <Button variant={'outline'} className={cn('bg-[#14B8A6] text-[#ffffff] m-auto')} onClick={() => uploadDocSetFiles()}>Update</Button>
                          </DialogFooter>
                        </>
                        :
                        <div className='w-full'>
                          <Loader2 className='animate-spin m-auto' />
                        </div>
                      }

                    </DialogContent>
                  </Dialog>
                </div>}
            </>
            :
            <div className='w-full text-center space-y-4'>
              <div className='w-full border flex flex-col gap-1 justify-center items-center min-h-[20vh] max-h-[40vh] bg-[#EFF5F5] rounded-md relative p-4 overflow-y-scroll'>

                {files?.map(file => <p key={file?.name} className='text-sm leading-6 break-all'>{file?.name}</p>)}
                <X size={'1rem'} className='self-start absolute top-1 right-1 hover:cursor-pointer' onClick={() => setFiles([])} />
              </div>

              <Button className={cn('bg-[#14B8A6] hover:bg-[#14B8A6] hover:opacity-80 ml-auto')} onClick={() => uploadFile(files)}>Upload</Button>
            </div>
          }
        </div>
      }
    </div>
  )
}

export default Upload