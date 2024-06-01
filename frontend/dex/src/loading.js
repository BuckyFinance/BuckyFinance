import React, { useState, useEffect } from 'react';

const LoadingAnimation = () => {
  //const loadingArray = ['▃','▅','▆','▇','▇','▆','▅','▃'];
  const loadingArray = ['⡿⣟⣷⢿⣻⣽⣯⣾', '⣽⣷⢿⡿⣻⣯⣾⣟', '⣾⣽⣷⡿⢿⣯⣻⣟', '⢿⣷⣯⣟⣾⣽⣻⡿', '⣟⣾⢿⣻⣽⡿⣯⣷', '⡿⣾⣻⣷⣯⢿⣟⣽', '⣯⣾⣷⣽⣻⢿⡿⣟', '⢿⣟⣽⣷⣯⣾⣻⡿', '⣷⣻⣟⣽⢿⣯⣾⡿', '⢿⣷⣟⣽⣾⣻⣯⡿', '⣟⢿⣻⣾⣯⣽⡿⣷', '⣷⡿⣟⣻⣯⢿⣽⣾', '⣯⣻⡿⢿⣷⣽⣾⣟', '⣯⣻⢿⣽⣾⣷⣟⡿', '⣟⣻⣷⣯⢿⡿⣾⣽', '⣟⣽⣻⣾⢿⡿⣯⣷', '⣽⣟⣾⣷⢿⣻⣯⡿', '⣾⣯⣷⣟⣽⣻⢿⡿', '⡿⣽⣷⣯⣟⣻⢿⣾', '⡿⣷⣯⣻⣾⣟⢿⣽', '⣾⣽⣟⣻⢿⣯⣷⡿', '⣟⣻⣾⣯⣷⣽⢿⡿', '⣻⣽⡿⢿⣟⣷⣯⣾', '⣽⡿⢿⣟⣯⣻⣾⣷', '⡿⢿⣽⣾⣟⣷⣯⣻', '⣻⢿⡿⣷⣯⣽⣾⣟', '⡿⣟⣻⣾⢿⣽⣷⣯', '⣷⡿⢿⣾⣽⣯⣟⣻', '⣾⣟⣷⣽⣯⢿⣻⡿', '⣻⣽⡿⣷⣾⣟⢿⣯', '⢿⣟⣽⣷⡿⣯⣾⣻', '⣟⡿⢿⣻⣷⣾⣯⣽']
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Function to update the index
    const updateIndex = () => {
      setIndex((prevIndex) => (prevIndex + 1) % loadingArray.length);
    };

    // Set interval to update index every 200ms
    const intervalId = setInterval(updateIndex, 50);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [loadingArray.length]);

  return (
    <span>
      {loadingArray[index]}
    </span>
  );
};

export default LoadingAnimation;