
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the events page
    navigate("/events");
  }, [navigate]);
  
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Redirecting to Calendar...</h1>
        <p className="mt-2 text-muted-foreground">Please wait...</p>
      </div>
    </div>
  );
};

export default Index;
