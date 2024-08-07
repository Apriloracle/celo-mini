'use client'
import React, { useState, useEffect } from 'react';
import { createWalletClient, custom } from 'viem';
import { celo } from 'viem/chains';
import { Engine } from "@thirdweb-dev/engine";
import ScoreCard from './ScoreCard';

declare global {
    interface Window {
        ethereum: any;
    }
}

class Celon extends React.Component<{}, { address: string | null; error: string | null; score: number }> {
    private engine: Engine;

    constructor(props: {}) {
        super(props);
        this.state = { 
            address: null, 
            error: null,
            score: 0
        };
        
        const accessToken = process.env.NEXT_PUBLIC_THIRDWEB_ENGINE_ACCESS_TOKEN;
        if (!accessToken) {
            throw new Error("Thirdweb Engine access token is not set in environment variables");
        }

        this.engine = new Engine({
            url: "https://engine-production-8cfe.up.railway.app",
            accessToken: accessToken,
        });
    }

    componentDidMount() {
        this.fetchAddress();
    }

    async fetchAddress() {
        if (typeof window.ethereum !== 'undefined') {
            const client = createWalletClient({
                chain: celo,
                transport: custom(window.ethereum),
            });

            const addresses = await client.getAddresses();
            if (addresses && addresses.length > 0) {
                this.setState({ address: addresses[0] });
            }
        } else {
            console.error('Ethereum provider not found');
        }
    }

    async getAddress(): Promise<string | null> {
        if (!this.state.address) {
            await this.fetchAddress();
        }
        return this.state.address;
    }

    handleTransfer = async () => {
        try {
            const address = await this.getAddress();

            if (!address) {
                throw new Error("Celo address not found");
            }

            const response = await fetch('https://us-central1-fourth-buffer-421320.cloudfunctions.net/handleTap', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Transfer failed');
            }

            const result = await response.json();
            console.log(result.message);

            // Increment the score
            this.setState(prevState => ({ score: prevState.score + 1, error: null }));

        } catch (err) {
            this.setState({ error: err instanceof Error ? err.message : String(err) });
        }
    };

    render() {
        const { address, error, score } = this.state;

        return (
            <div className='flex flex-col items-center space-y-4'>
                <div className='text-sm'>
                    {address ? `Celo Address: ${address}` : 'Loading...'}
                </div>
                <ScoreCard score={score} />
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f05e23] to-[#d54d1b] rounded-full opacity-30 animate-ping"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#f05e23] to-[#d54d1b] rounded-full opacity-30 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <button
                        onClick={this.handleTransfer}
                        className="relative w-52 h-52 bg-gradient-to-br from-[#f05e23] to-[#d54d1b] 
                            text-white rounded-full flex items-center justify-center 
                            text-lg font-bold transition-all duration-300 ease-in-out
                            shadow-[0_10px_20px_rgba(240,94,35,0.3),inset_0_-5px_10px_rgba(0,0,0,0.2)] 
                            hover:shadow-[0_15px_30px_rgba(240,94,35,0.5),inset_0_-7px_15px_rgba(0,0,0,0.3)]
                            active:shadow-[0_5px_10px_rgba(240,94,35,0.3),inset_0_-2px_5px_rgba(0,0,0,0.2)]
                            transform hover:-translate-y-1 active:translate-y-1
                            before:content-[''] before:absolute before:top-0 before:left-0 
                            before:w-full before:h-full before:rounded-full
                            before:bg-gradient-to-b before:from-white/30 before:to-transparent 
                            before:opacity-100 hover:before:opacity-80 active:before:opacity-50 before:transition-opacity
                            overflow-hidden"
                        style={{
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            boxShadow: '0 10px 20px rgba(240,94,35,0.3), inset 0 -5px 10px rgba(0,0,0,0.2), 0 0 0 6px rgba(240,94,35,0.2), 0 0 0 12px rgba(240,94,35,0.1)',
                        }}
                    >
                        Tap to earn
                    </button>
                </div>
                {error && (
                    <p className="text-red-500">Error: {error}</p>
                )}
            </div>
        );
    }
}

export default Celon;
