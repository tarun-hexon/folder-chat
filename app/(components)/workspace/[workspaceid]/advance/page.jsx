'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import { Indexing, Slack, GitPrs, Files, Drive, Confluence, Web } from '../../../(common)'
import { Input } from '../../../../../components/ui/input';
import searchIcon from '../../../../../public/assets/search.svg';
import drive from '../../../../../public/assets/Danswer-google-B.svg'
import web from '../../../../../public/assets/Danswer-web-B.svg'
import slack from '../../../../../public/assets/Danswer-slack-B.svg'
import confluence from '../../../../../public/assets/Danswer-confluence-B.svg'
import file from '../../../../../public/assets/Danswer-doc-B.svg'
import { useAtom } from 'jotai';
import { showAdvanceAtom } from '../../../../store';
import { MoreHorizontal } from 'lucide-react';
import ReactMarkdown from "react-markdown";

const AdvancePage = () => {
    const [selected, setSelected] = useState('auto');
    const [search, setSearch] = useState('');
    const [msgLoader, setMsgLoader] = useState(false)
    const [rcvdMsg, setRcvdMsg] = useState('')
    const [inputFieldDisabled, setInputFieldDisabled] = useState(false);
    const [responseObj, setResponseObj] = useState(null)
    const [showAdvance, setShowAdvance] = useAtom(showAdvanceAtom);

    function iconSelector(name){
        if(name === 'web'){
            return web
        }else if(name === 'drive'){
            return drive
        }else if(name === 'confluence'){
            return confluence
        }else if(name === 'slack'){
            return slack
        }else if(name === 'file'){
            return file
        }
    }

    async function sendChatMsgs(userMsg) {
        if (userMsg && userMsg.trim() === '') return null;
        if(rcvdMsg !== ''){
            setRcvdMsg('')
        }
        setInputFieldDisabled(true);
        setMsgLoader(true);
        setResponseObj(null)
        try {
            const sendQuery = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/query/stream-query-validation`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "query": userMsg
                })
            });
            const sendMessageResponse = await fetch(`${process.env.NEXT_PUBLIC_INTEGRATION_IP}/api/query/stream-answer-with-quote`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "messages": [
                        {
                            "message": userMsg,
                            "sender": null,
                            "role": "user"
                        }
                    ],
                    "persona_id": 0,
                    "prompt_id": null,
                    "retrieval_options": {
                        "run_search": "always",
                        "real_time": true,
                        "filters": {
                            "source_type": null,
                            "document_set": null,
                            "time_cutoff": null
                        },
                        "enable_auto_detect_filters": false
                    }
                })
            });

            if (!sendMessageResponse.ok) {
                const errorJson = await sendMessageResponse.json();
                const errorMsg = errorJson.message || errorJson.detail || "";
                throw new Error(`Failed to send message - ${errorMsg}`);
            }

            await handleStream(
                sendMessageResponse
            );
            setInputFieldDisabled(false)

        } catch (error) {
            console.log(error)
            
            setInputFieldDisabled(false)
        }
    };
    async function handleStream(streamingResponse, userMsg) {
        const reader = streamingResponse.body?.getReader();
        const decoder = new TextDecoder("utf-8");

        let previousPartialChunk = null;
        while (true) {
            const rawChunk = await reader?.read();
            if (!rawChunk) {
                throw new Error("Unable to process chunk");
            }
            const { done, value } = rawChunk;
            if (done) {
                break;
            }

            const [completedChunks, partialChunk] = processRawChunkString(
                decoder.decode(value, { stream: true }),
                previousPartialChunk
            );
            if (!completedChunks.length && !partialChunk) {

                break;
            }
            previousPartialChunk = partialChunk;

            const response = await Promise.resolve(completedChunks);

            if (response.length > 0) {

                for (const obj of response) {
                    if (obj.answer_piece) {
                        setRcvdMsg(prev => prev + obj.answer_piece);
                    } else if (obj.top_documents) {

                        setResponseObj(obj);
                        
                    } else if (obj.error) {
                        setMsgLoader(false);
                        return toast({
                            variant: 'destructive',
                            description: 'Something Went Wrong!'
                        })
                    }
                }

            };

        }
    };

    const processRawChunkString = (rawChunkString, previousPartialChunk) => {
        if (!rawChunkString) {
            return [[], null];
        }

        const chunkSections = rawChunkString
            .split("\n")
            .filter((chunk) => chunk.length > 0);

        let parsedChunkSections = [];
        let currPartialChunk = previousPartialChunk;

        chunkSections.forEach((chunk) => {
            const [processedChunk, partialChunk] = processSingleChunk(
                chunk,
                currPartialChunk
            );

            if (processedChunk) {
                parsedChunkSections.push(processedChunk);
                currPartialChunk = null;
            } else {
                currPartialChunk = partialChunk;
            }
        });

        return [parsedChunkSections, currPartialChunk];
    };

    const processSingleChunk = (chunk, currPartialChunk) => {
        const completeChunk = (currPartialChunk || "") + chunk;

        try {
            // every complete chunk should be valid JSON
            const chunkJson = JSON.parse(completeChunk);
            return [chunkJson, null];
        } catch (err) {
            // if it's not valid JSON, then it's probably an incomplete chunk
            return [null, completeChunk];
        }
    };

    const buildDocumentSummaryDisplay = (matchHighlights, blurb) => {
        if (matchHighlights.length === 0) {
          return blurb;
        }
      
        let sections = [];
        matchHighlights.forEach((matchHighlight, matchHighlightIndex) => {
          if (!matchHighlight) {
            return;
          }
      
          const words = matchHighlight.split(new RegExp("\\s"));
          words.forEach((word) => {
            if (!word) {
              return;
            }
      
            let isContinuation = false;
            while (word.includes("<hi>") && word.includes("</hi>")) {
              const start = word.indexOf("<hi>");
              const end = word.indexOf("</hi>");
              const before = word.slice(0, start);
              const highlight = word.slice(start + 4, end);
              const after = word.slice(end + 5);
      
              if (before) {
                sections.push([before, false, isContinuation]);
                isContinuation = true;
              }
              sections.push([highlight, true, isContinuation]);
              isContinuation = true;
              word = after;
            }
      
            if (word) {
              sections.push([word, false, isContinuation]);
            }
          });
          if (matchHighlightIndex != matchHighlights.length - 1) {
            sections.push(["...", false, false]);
          }
        });
      
        let previousIsContinuation = sections[0][2];
        let previousIsBold = sections[0][1];
        let currentText = "";
        const finalJSX = [];
        sections.forEach(([word, shouldBeBold, isContinuation], index) => {
          if (shouldBeBold != previousIsBold) {
            if (currentText) {
              if (previousIsBold) {
                currentText = currentText.trim();
                if (!previousIsContinuation) {
                  finalJSX[finalJSX.length - 1] = finalJSX[finalJSX.length - 1] + " ";
                }
                finalJSX.push(
                  document.createElement('b').appendChild(document.createTextNode(currentText))
                );
              } else {
                finalJSX.push(currentText);
              }
            }
            currentText = "";
          }
          previousIsBold = shouldBeBold;
          previousIsContinuation = isContinuation;
          if (!isContinuation || index === 0) {
            currentText += " ";
          }
          currentText += word;
        });
        if (currentText) {
          if (previousIsBold) {
            currentText = currentText.trim();
            if (!previousIsContinuation) {
              finalJSX[finalJSX.length - 1] = finalJSX[finalJSX.length - 1] + " ";
            }
            finalJSX.push(
              document.createElement('b').appendChild(document.createTextNode(currentText))
            );
          } else {
            finalJSX.push(currentText);
          }
        }
        console.log(finalJSX)
        return finalJSX;
      };

    useEffect(()=> {
        // setShowAdvance(true)
    }, []);

    return (
        <>
            <div className='w-full sticky top-0 self-start flex flex-col rounded-[6px] gap-5 items-center  box-border text-[#64748B] '>
                <div className='w-[80%] rounded-[6px] flex flex-col box-border space-y-2 gap-2 overflow-scroll no-scrollbar px-4 py-10'>
                    <div className='self-start space-x-2  border p-1 rounded-md text-[14px] font-[500] leading-5'>
                        <button className={`${selected === 'auto' && 'bg-[#14B8A6] text-white'} p-3 rounded-lg px-5`} onClick={() => setSelected('auto')}>Auto</button>
                        <button className={`${selected === 'ai' && 'bg-[#14B8A6] text-white'} p-3 rounded-lg`} onClick={() => setSelected('ai')}>AI Search</button>
                        <button className={`${selected === 'key' && 'bg-[#14B8A6] text-white'} p-3 rounded-lg`} onClick={() => setSelected('key')}>Keyword Search</button>
                    </div>
                    <div className='w-full relative flex '>
                        <Input
                            type='text'
                            placeholder='Search'
                            className={`pr-10 ${inputFieldDisabled ? 'hover:cursor-not-allowed' : ''}`}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            disabled={inputFieldDisabled}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    sendChatMsgs(search)
                                    setSearch('')
                                    
                                }
                            }}
                        />
                        <Image src={searchIcon} alt='search' className='absolute right-2 top-2 hover:cursor-pointer' />
                    </div>
                    <div className='flex flex-col justify-between p-2 px-3 gap-4 text-sm border rounded-md'>
                        <h2 className='font-[600]  leading-5 self-start'>AI Answer</h2>
                        <div className='font-[400] leading-6 text-justify'>
                            {msgLoader && <p className='font-[400] text-sm leading-6 self-start w-full bg-transparent py-2 px-4 rounded-lg text-justify rounded-tl-[0px]'>
                                {rcvdMsg === '' ? <MoreHorizontal className='m-auto animate-pulse' /> :
                                    <ReactMarkdown
                                        className='w-full'
                                        components={{
                                            a: ({ node, ...props }) => (
                                                <a
                                                    {...props}
                                                    className="text-blue-500 hover:text-blue-700"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                />
                                            ),
                                            pre: ({ node, ...props }) => (
                                                <div className="overflow-auto  max-w-[18rem] w-full text-white my-2 bg-[#121212] p-2 rounded-lg">
                                                    <pre {...props} />
                                                </div>
                                            ),
                                            code: ({ node, ...props }) => (
                                                <code className="bg-[#121212] text-white rounded-lg p-1 w-full" {...props} />
                                            ),
                                            ul: ({ node, ...props }) => (
                                                <ul className="md:pl-10 leading-8 list-disc" {...props} />
                                            ),
                                            ol: ({ node, ...props }) => (
                                                <ol className="md:pl-10 leading-8 list-decimal" {...props} />
                                            ),
                                            menu: ({ node, ...props }) => (
                                                <p className="md:pl-10 leading-8" {...props} />
                                            ),
                                        }}
                                    >
                                        {rcvdMsg?.replaceAll("\\n", "\n")}
                                    </ReactMarkdown>}
                            </p>}
                        </div>

                        {/* <div className='flex flex-col font-[500] text-[12px] leading-5 '>
                            <h2 className='self-start'>Sources</h2>
                            <div className='flex gap-2'>
                                <div className='p-2 border rounded-md inline-flex gap-2 hover:cursor-pointer'>
                                    <Image src={gDriveIcon} alt='drive' />
                                    <span>User Onboarding Doc 2023</span>
                                </div>
                                <div className='p-2 border rounded-md inline-flex gap-2 hover:cursor-pointer'>
                                    <Image src={webIcon} alt='drive' />
                                    <span>Onboarding - Advance Document</span>
                                </div>
                            </div>
                        </div> */}
                    </div>
                    {/* <div className='flex flex-col gap-5 pb-5'>
                        <h2 className='font-[600] text-sm leading-5 self-start'>Results</h2>

                        {responseObj !== null && responseObj?.top_documents?.map(res => {
                            return (
                                <div className='w-full relative flex flex-col gap-2 hover:cursor-pointer' key={res.id}>
                                    <div className='inline-flex gap-2 '>
                                        <Image src={iconSelector(res.source_type)} alt='icon' />
                                        <span className='font-[600] text-[12px] leading-5'>{res?.semantic_identifier}</span>
                                    </div>
                                    <div className='font-[400] text-sm leading-6 text-justify break-words'>
                                        {buildDocumentSummaryDisplay(res.match_highlights, res.blurb)?.map((content, idx) => typeof content === String ? content : '')}
                                    </div>
                                </div>
                            )
                        })}

                    </div> */}
                </div>
            </div>

        </>
    )
}

export default AdvancePage