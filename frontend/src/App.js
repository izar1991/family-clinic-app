import React from "react";
import { AppBar, Toolbar, Typography, Tabs, Tab, Box, Container, Paper, Button, Stack } from "@mui/material";
import { useState } from "react";
import DirectorMedico from "./pages/DirectorMedico";

function Section({ title, children }) {
  return (
    <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>{title}</Typography>
      <Typography variant="body1">{children}</Typography>
    </Paper>
  );
}

function App() {
  const [tab, setTab] = useState(0);
  const [personalPage, setPersonalPage] = useState(null);

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Family Clinic App
          </Typography>
          <Tabs value={tab} onChange={(_, v) => { setTab(v); setPersonalPage(null); }} textColor="inherit" indicatorColor="secondary">
            <Tab label="Contabilidad" />
            <Tab label="Personal" />
            <Tab label="Estatutos" />
          </Tabs>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 5 }}>
        {tab === 0 && (
          <Section title="Contabilidad">
            Aquí pots gestionar les finances de la clínica, veure ingressos, despeses i informes.
          </Section>
        )}
        {tab === 1 && (
          personalPage === null ? (
            <Section title="Personal">
              <Typography variant="body1" gutterBottom>
                Consulta la llista de professionals que necessita la clínica:
              </Typography>
              <Stack spacing={2} direction="row">
                <Button variant="contained" onClick={() => setPersonalPage("director")}>
                  Director Médico
                </Button>
                {/* Pots afegir més botons per altres professionals */}
              </Stack>
            </Section>
          ) : (
            personalPage === "director" && (
              <React.Suspense fallback={<div>Carregant...</div>}>
                <DirectorMedico />
              </React.Suspense>
            )
          )
        )}
        {tab === 2 && (
          <Section title="Estatutos">
            Accedeix als estatuts i normatives internes de la clínica.
          </Section>
        )}
      </Container>
    </>
  );
}

export default App;