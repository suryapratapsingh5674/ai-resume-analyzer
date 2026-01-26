import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import ScoreCircle from './ScoreCurcle'
import { usePuterStore } from '~/lib/puter'

const ResumeCard = ({resume}:{ resume:Resume}) => {

  const {fs} = usePuterStore();
  const [resumeUrl, setResumeUrl] = useState('')

  useEffect(()=>{
    const loadResume = async ()=>{
      const blob = await fs.read(resume.imagePath);
      if(!blob) return;
      const url = URL.createObjectURL(blob);
      setResumeUrl(url);
    }

    loadResume();
  },[resume.imagePath])
  console.log(resume);

  return (
    <Link
      to={`/resume/${resume.id}`}
      className="resume-card animate-in fade-in duration-1000"
    >
      <div className="resume-card-header">
        <div className="flex flex-col gap-2">
          { resume.componyName && <h2 className="!text-black font-bold break-word">
            {resume.componyName}
          </h2>}
          {resume.jobTitle && <h3 className="text-lg break-word text-gray-500">
            {resume.jobTitle}
          </h3>}
          {!resume.componyName && !resume.jobTitle && <h2 className='!text-black font-bold'>Resume</h2>}
        </div>
        <div className="flex-shrink-0">
          <ScoreCircle score={resume.feedback.overallScore} />
        </div>
      </div>
      {resumeUrl && (<div className='gradiant-border fade-in animate-in duration-1000'>
        <div className='w-full h-full'>
            <img src={resumeUrl} alt="" className='w-full h-[350px] max-sm:h-[200px] object-cover object-top'/>
        </div>
      </div>)}
    </Link>
  );
}

export default ResumeCard