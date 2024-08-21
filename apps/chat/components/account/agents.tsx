'use client';

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getJWT } from '@/lib/jwt';
// import { ProfileImage } from '@/components/account/profile-image'
import { Button } from '@/components/ui/button';
import { IconDots } from '@/components/ui/icons'
import { deployEndpointUrl } from '@/utils/const/endpoints';
import { isValidUrl } from '@/utils/helpers/urls';
import { useMultiplayerActions } from '@/components/ui/multiplayer-actions'
import { useRouter } from 'next/navigation'

import { SparkLineChart } from '@mui/x-charts/SparkLineChart';


export interface AgentsProps {
  agents: object[];
  userIsCurrentUser: boolean;
}

export function Agents({ agents: agentsInit, userIsCurrentUser }: AgentsProps) {
  const router = useRouter();
  const [agents, setAgents] = useState(() => agentsInit);
  const [openAgentIndex, setOpenAgentIndex] = useState(-1);

  const { agentJoin } = useMultiplayerActions();

  return (
    <div className="flex m-auto w-full max-w-4xl">
      <div className="w-full m-auto my-4 border rounded-md p border-zinc-700">
        <div className="px-5 py-4">

          <div className="w-full">
            <div className="mb-8 text-2xl">Agents</div>
            <div className="flex">
              <div className="w-full">
                <div className="relative overflow-x-auto">
                  <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      
                      <thead className="text-xs text-gray-50 uppercase bg-border">
                        <tr>
                          <th key={'preview'} scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)]">Preview</th>
                          <th key={'info'} scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)]">Info</th>
                          <th key={'creds'} scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)]">Credits Used</th>
                          <th key={'chart'} scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)]">Chart</th>
                          <th key={'version'} scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)]">Version</th>
                          <th key={'actions'} scope="col" className="px-6 py-3 text-[rgba(255,255,255,0.6)]">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {agents.map((agent: object, i: number) => {
                          const {
                            id,
                            name,
                            description,
                            start_url,
                            preview_url,
                            version,
                            credits_usage
                          } = agent as any;

                          const sparklineData = credits_usage
                            ? credits_usage.map((credit: { created_at: any; amount: number; }) => (credit.amount * 1000))
                            : [];

                          // Get the sum of all credits used by the agent
                          const overallCreditsUsed = sparklineData.reduce((total: any, currentValue: any) => total + currentValue, 0) ?? 0;

                          return (
                            <tr className="hover:bg-border text-white bg-[rgba(255,255,255,0.1)] mt-1" key={i}>

                              <td key={'t-0'} className="px-6 py-4 text-md capitalize align-top">
                                <div className="mr-4 mb-4 size-[60px] min-w-12 bg-[rgba(0,0,0,0.1)] overflow-hidden dark:bg-[rgba(255,255,255,0.1)] rounded-[8px] flex items-center justify-center">
                                  {preview_url && isValidUrl(preview_url) ? (
                                    <Image className="flex" width={60} height={60} src={preview_url} alt='Profile picture' />
                                  ) : (
                                    <div className='uppercase text-lg font-bold'>{name.charAt(0)}</div>
                                  )}
                                </div>
                              </td>

                              <td key={'t-1'} className="px-6 py-4 text-md capitalize align-top">
                                <div>{name}</div>
                                <div>{description}</div>
                              </td>

                              <td key={'t-2'} className="px-6 py-4 text-md capitalize align-top">
                                {Math.round(overallCreditsUsed)}
                              </td>

                              <td key={'chart'} className="px-6 py-4 text-md capitalize align-top">
                                <SparkLineChart data={sparklineData} colors={['#a855f7']} height={50} />
                              </td>

                              <td key={'t-3'} className="px-6 py-4 text-md capitalize align-top">
                                {version}
                              </td>

                              <td key={'t-4'} className="px-6 py-4 text-md capitalize align-top">
                                {userIsCurrentUser && <>
                                  <div className="flex flex-col px-2 py-1 mb-auto cursor-pointer rounded border bg-primary/10 hover:bg-primary/20 active:bg-primary/30" onClick={e => {
                                    setOpenAgentIndex(i === openAgentIndex ? -1 : i);
                                  }}>
                                    <IconDots />
                                  </div>
                                  {i === openAgentIndex && <div className="absolute flex flex-col top-8 right-0 p-2 rounded border cursor-auto bg-primary/10">
                                    <Button variant="outline" className="text-xs mb-1" onClick={e => {
                                      setOpenAgentIndex(-1);

                                      (async () => {
                                        await agentJoin(id);
                                      })();
                                    }}>
                                      Chat
                                    </Button>
                                    <Button variant="outline" className="text-xs mb-1" onClick={e => {
                                      setOpenAgentIndex(-1);

                                      router.push(`/agents/${id}/logs`);
                                    }}>
                                      Logs
                                    </Button>
                                    <Button variant="destructive" className="text-xs" onClick={e => {
                                      setOpenAgentIndex(-1);

                                      (async () => {
                                        const jwt = await getJWT();
                                        const res = await fetch(`${deployEndpointUrl}/agent`, {
                                          method: 'DELETE',
                                          body: JSON.stringify({
                                            guid: id,
                                          }),
                                          headers: {
                                            'Content-Type': 'application/json',
                                            Authorization: `Bearer ${jwt}`,
                                          },
                                        });
                                        if (res.ok) {
                                          await res.blob();

                                          setAgents((agents: object[]) => {
                                            return agents.filter((agent: any) => agent.id !== id);
                                          });
                                        } else {
                                          console.warn(`invalid status code: ${res.status}`);
                                        }
                                      })();
                                    }}>Delete</Button>
                                  </div>}
                                </>}
                              </td>

                            </tr>

                          );
                        })}

                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
