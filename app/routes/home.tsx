import type { Route } from "./+types/home";
import Navbar from '../components/Navbar'
import ResumeCard from "~/components/ResumeCard";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";


export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback from your dream job!" },
  ];
}

export default function Home() {

  const {auth, kv} = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([])
  const [lodingResumes, setLodingResumes] = useState(false)

  useEffect(()=>{
    if(!auth.isAuthenticated)navigate('/auth?next=/');
  }, [auth.isAuthenticated])

  useEffect(()=>{
    const loadResume = async ()=>{
      setLodingResumes(true);
      const resumes = (await kv.list('resume:*', true)) as KVItem[];
      const parsedResumes = resumes?.map((resume)=>(
        JSON.parse(resume.value) as Resume
      ))
      setResumes(parsedResumes || []);
      setLodingResumes(false);
    }
    loadResume();
  }, [])

  return <main className="bg-[#EEF2FF] bg-cover">
    <Navbar/>
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Application & Resume Ratings</h1>
        {!lodingResumes && resumes?.length === 0 ? (
          <h2>No resume find. Uplod your first resume to get feedback.</h2>
        ) : (
          <h2>Review your submission and check AI-powered feedback.</h2>
        )}
      </div>

      {lodingResumes && (
        <div className="flex flex-col items-center justify-center">
          <img src="/images/resume-scan-2.gif" alt="" className="w-[200px]" />
        </div>
      )}

      {!lodingResumes && resumes.length > 0 && (
      <div className="flex flex-col items-center justify-center gap-4">
        <Link to='/wipe' className="bg-[#828cfa] text-white px-4 py-2 rounded-2xl">
        Clear all resume
        </Link>  
      <div className="resumes-section">
        {resumes.map((resume)=>(
          <ResumeCard key={resume.id} resume={resume}/>
        ))}
      </div>
      </div>
     )}

     {!lodingResumes && resumes.length == 0 && (
      <div className="flex flex-col items-center justify-center mt-10 gap-4">
        <Link to='/upload' className="primary-button w-fit text-xl font-semibold">
        Upload Resume
        </Link>
      </div>
     )}
    </section>
  </main>;
}
