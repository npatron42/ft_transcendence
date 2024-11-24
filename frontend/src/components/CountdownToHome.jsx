import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import "./countdown.css"

const CountdownToHome = () => {
	const [seconds, setSeconds] = useState(1);
	const navigate = useNavigate();

  useEffect(() => {
    if (seconds === 0) return;

    const interval = setInterval(() => {
      setSeconds(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [seconds]);

  const toHome = () => {
	navigate("/home");
	return ;
  }

  return (
    <div className="countdownLoser">
		{seconds !== 0 && (
			<span className="secondsLoser">Redirection to Home in {seconds}</span>
		)}
		{seconds === 0 && (
			<span className="loader-2">{toHome()}</span>
		)}
    </div>
  );
};

export default CountdownToHome