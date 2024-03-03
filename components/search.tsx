'use client'

import { useState } from 'react';
import "../styles/style.scss";
import "./search.scss";
import { useRouter } from 'next/navigation'
import Link from 'next/link';

export default function Search() {
    const [data, setData] = useState({ id: '', chain: 'eth' });
    const router = useRouter();

    const search = (formData) => {
        router.push(`/position/${formData.get("chain")}/${formData.get("id")}`);
    };

    return (
        <div className='search'>
            <div className='header'>
                <Link className='home' href="/">🏠</Link>
                <h2>Search your position</h2></div>
            <form className='search-form' action={search}>

                <input placeholder='Position Id' className='input' name="id" type='input' defaultValue={data.id}></input>
                <select defaultValue={data.chain} className='select' name="chain">
                    <option value={'eth'}>Ethereum</option>
                    <option value={'arbitrum'}>Arbitrum</option>
                    <option value={'polygon'}>Polygon</option>
                    <option value={'optimism'}>Optimism</option>
                </select>
                <button className='button' type='submit'>Search</button>
            </form>
        </div>)
}