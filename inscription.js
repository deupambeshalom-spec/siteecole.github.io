const applicationForm = document.querySelector("#application-form");
const applicationFeedback = document.querySelector("#application-feedback");
const applicationStorageKey = "horizon.demo.applications";

applicationForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formValues = Object.fromEntries(new FormData(applicationForm).entries());
  const savedApplications = localStorage.getItem(applicationStorageKey);
  const applications = savedApplications === null ? [] : JSON.parse(savedApplications);
  if (!Array.isArray(applications)) {
    throw new Error("Les demandes d’inscription enregistrées sont invalides.");
  }

  const application = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: `${formValues.prenom.trim()} ${formValues.nom.trim()}`,
    birthDate: formValues.naissance,
    email: formValues.email.trim(),
    phone: formValues.telephone.trim(),
    program: formValues.formation,
    level: formValues.niveau,
    address: formValues.adresse.trim(),
    message: formValues.message.trim(),
    status: "pending",
    submittedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(applicationStorageKey, JSON.stringify([...applications, application]));
  } catch (error) {
    applicationFeedback.textContent = "La demande n’a pas pu être enregistrée dans ce navigateur.";
    applicationFeedback.classList.add("portal-error");
    applicationFeedback.hidden = false;
    throw error;
  }

  applicationForm.reset();
  applicationFeedback.textContent = "Votre demande a été enregistrée. L’équipe de l’école pourra la consulter.";
  applicationFeedback.classList.remove("portal-error");
  applicationFeedback.hidden = false;
});
