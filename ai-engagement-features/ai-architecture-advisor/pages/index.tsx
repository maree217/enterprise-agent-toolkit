import Head from 'next/head'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { SearchDialog } from '@/components/SearchDialog'
import Image from 'next/image'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>AI Architecture Advisor | AI Capability Builder</title>
        <meta
          name="description"
          content="Get expert AI architecture advice powered by real enterprise implementations and best practices."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.center}>
          <SearchDialog />
        </div>

        <div className="py-8 w-full flex flex-col items-center justify-center space-y-4">
          <h1 className="text-4xl font-bold text-center text-gray-900 mb-2">
            AI Architecture Advisor
          </h1>
          <p className="text-lg text-center text-gray-600 mb-6 max-w-2xl">
            Get expert guidance on AI implementation strategies, technology patterns, and architecture decisions 
            based on real enterprise deployments worth £18.5M+
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-blue-100 px-4 py-2 rounded-full text-blue-800 text-sm">
              Multi-Agent Systems
            </div>
            <div className="bg-green-100 px-4 py-2 rounded-full text-green-800 text-sm">
              RAG Architectures  
            </div>
            <div className="bg-purple-100 px-4 py-2 rounded-full text-purple-800 text-sm">
              Microsoft Copilot
            </div>
            <div className="bg-orange-100 px-4 py-2 rounded-full text-orange-800 text-sm">
              Semantic Kernel
            </div>
          </div>

          <div className="opacity-75 transition hover:opacity-100 cursor-pointer">
            <Link href="https://aicapabilitybuilder.com" className="flex items-center justify-center">
              <p className="text-base mr-2">Powered by AI Capability Builder</p>
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
