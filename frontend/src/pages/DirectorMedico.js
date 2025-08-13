import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

// Chart.js via npm

// Tailwind via CDN (for dev, best to use via PostCSS in production)
const tailwindScript = document.createElement("script");
tailwindScript.src = "https://cdn.tailwindcss.com";
document.head.appendChild(tailwindScript);

const diasHabilesMes = 20;
const horasDia = 8;
const horasTotalesMes = diasHabilesMes * horasDia;
const minSalario = 1992.5;
const ssPercentage = 600 / 1992.5;

function formatTime(patientsPerHour) {
    if (patientsPerHour <= 0 || !isFinite(patientsPerHour)) return "un tiempo infinito";
    const timeInHours = 1 / patientsPerHour;
    const hours = Math.floor(timeInHours);
    const minutes = Math.round((timeInHours - hours) * 60);

    if (hours > 0 && minutes > 0) {
        return `${hours} hora${hours > 1 ? "s" : ""} y ${minutes} minuto${minutes > 1 ? "s" : ""}`;
    } else if (hours > 0) {
        return `${hours} hora${hours > 1 ? "s" : ""}`;
    } else {
        return `${minutes} minuto${minutes > 1 ? "s" : ""}`;
    }
}

export default function DirectorMedico() {
    // Refs for charts
    const costChartRef = useRef(null);
    const profitChartRef = useRef(null);
    const myCostChart = useRef(null);
    const myProfitChart = useRef(null);

    // State for inputs
    const [inputs, setInputs] = React.useState({
        salarioBruto: 1992.5,
        precioPaciente: 30,
        porcentajeEmpresa: 50,
        cuotaAutonomoBase: 310,
        deduccionFiscalEmpresa: 25,
        interesAnual: 5,
    });

    // State for error message
    const [message, setMessage] = React.useState("");

    // State for calculated values
    const [calc, setCalc] = React.useState({});

    // Handler for input changes
    function handleInputChange(e) {
        const { id, value } = e.target;
        setInputs((prev) => ({
            ...prev,
            [id.replace("Input", "")]: parseFloat(value),
        }));
    }

    // Main calculation and chart update
    useEffect(() => {
        // Destructure inputs
        const {
            salarioBruto,
            precioPaciente,
            porcentajeEmpresa,
            cuotaAutonomoBase,
            deduccionFiscalEmpresa,
            interesAnual,
        } = inputs;

        // Validation
        if (salarioBruto < minSalario) {
            setMessage(`Error: El salario bruto no puede ser inferior a ${minSalario.toFixed(2)} €.`);
            return;
        }
        if (precioPaciente <= 0) {
            setMessage("Error: El precio por paciente debe ser mayor que 0.");
            return;
        }
        setMessage("");

        // Calculations
        const interesFactor = 1 + interesAnual / 100;
        const costeSeguridadSocial = salarioBruto * ssPercentage;
        const costeBrutoBase = salarioBruto + costeSeguridadSocial;
        const costeBrutoTotalConInteres = costeBrutoBase * interesFactor;
        const deduccionMonto = costeSeguridadSocial * (deduccionFiscalEmpresa / 100);
        const costeNeto = costeBrutoBase - deduccionMonto;
        const cuotaAutonomoConInteres = cuotaAutonomoBase * interesFactor;
        const porcentajeAutonomo = 100 - porcentajeEmpresa;

        // Cost intersection
        const costeEmpresaPorPaciente = precioPaciente * (porcentajeEmpresa / 100);
        let xCostIntersection = 0;
        if (costeEmpresaPorPaciente * horasTotalesMes !== 0) {
            xCostIntersection = (costeNeto - cuotaAutonomoConInteres) / (costeEmpresaPorPaciente * horasTotalesMes);
        }
        const yCostIntersection = costeNeto;

        // Break-even
        const ingresoEmpresaPorPaciente = precioPaciente * (porcentajeEmpresa / 100);
        let breakEvenValueOp2 = 0;
        if (ingresoEmpresaPorPaciente * horasTotalesMes !== 0) {
            breakEvenValueOp2 = costeNeto / (ingresoEmpresaPorPaciente * horasTotalesMes);
        }
        let breakEvenValueAutonomo = 0;
        if (ingresoEmpresaPorPaciente * horasTotalesMes !== 0) {
            breakEvenValueAutonomo = cuotaAutonomoConInteres / (ingresoEmpresaPorPaciente * horasTotalesMes);
        }
        let peOp2Tiempo = 0;
        if (precioPaciente * horasTotalesMes !== 0) {
            peOp2Tiempo = costeNeto / (precioPaciente * horasTotalesMes);
        }

        // Table data
        const pacientesPorHoraTabla = [0, 1, 2, 4];
        const pacientesMesTabla = pacientesPorHoraTabla.map((p) => p * horasTotalesMes);
        const ingresoTotalTabla = pacientesMesTabla.map((p) => p * precioPaciente);
        const beneficioOpcion1_real_tabla = ingresoTotalTabla.map(
            (i) => i * (porcentajeEmpresa / 100) - cuotaAutonomoConInteres
        );
        const beneficioOpcion2_fijo_neto_tabla = ingresoTotalTabla.map((i) => i - costeNeto);

        // Chart data
        const increment = 0.05;
        const pacientesPorHoraGrafica = [];
        for (let i = 0; i <= 4; i += increment) {
            pacientesPorHoraGrafica.push(parseFloat(i.toFixed(2)));
        }
        const pacientesMesGrafica = pacientesPorHoraGrafica.map((p) => p * diasHabilesMes * horasDia);
        const ingresosBrutosGrafica = pacientesMesGrafica.map((p) => p * precioPaciente);
        const costeOpcion1_coste_empresa = ingresosBrutosGrafica.map((i) => i * (porcentajeEmpresa / 100));
        const costeOpcion1_real_grafica = ingresosBrutosGrafica.map(
            (i) => i * (porcentajeEmpresa / 100) + cuotaAutonomoConInteres
        );
        const costeOpcion2_fijo_grafica = Array(pacientesPorHoraGrafica.length).fill(costeBrutoTotalConInteres);
        const costeOpcion2_fijo_neto_grafica = Array(pacientesPorHoraGrafica.length).fill(costeNeto);

        const beneficioOpcion1_solo_porcentaje_grafica = ingresosBrutosGrafica.map((i) => i * (porcentajeEmpresa / 100));
        const beneficioOpcion1_conAutonomo_grafica = ingresosBrutosGrafica.map(
            (i) => i * (porcentajeEmpresa / 100) - cuotaAutonomoConInteres
        );
        const beneficioOpcion2_grafica_bruto = ingresosBrutosGrafica.map((i) => i - costeBrutoTotalConInteres);
        const beneficioOpcion2_grafica_neto = ingresosBrutosGrafica.map((i) => i - costeNeto);

        // Save all calculated values for rendering
        setCalc({
            salarioBruto,
            precioPaciente,
            porcentajeEmpresa,
            porcentajeAutonomo,
            cuotaAutonomoBase,
            cuotaAutonomoConInteres,
            deduccionFiscalEmpresa,
            deduccionMonto,
            costeSeguridadSocial,
            costeBrutoTotalConInteres,
            costeNeto,
            xCostIntersection,
            yCostIntersection,
            pacientesPorHoraTabla,
            ingresoTotalTabla,
            beneficioOpcion1_real_tabla,
            beneficioOpcion2_fijo_neto_tabla,
            breakEvenValueOp2,
            breakEvenValueAutonomo,
            peOp2Tiempo,
            pacientesPorHoraGrafica,
            costeOpcion1_coste_empresa,
            costeOpcion1_real_grafica,
            costeOpcion2_fijo_grafica,
            costeOpcion2_fijo_neto_grafica,
            beneficioOpcion1_solo_porcentaje_grafica,
            beneficioOpcion1_conAutonomo_grafica,
            beneficioOpcion2_grafica_bruto,
            beneficioOpcion2_grafica_neto,
        });

        // Chart.js: Cost Chart
        if (costChartRef.current) {
            if (myCostChart.current) {
                myCostChart.current.data.labels = pacientesPorHoraGrafica;
                myCostChart.current.data.datasets[0].data = costeOpcion1_coste_empresa.map((y, i) => ({
                    x: pacientesPorHoraGrafica[i],
                    y,
                }));
                myCostChart.current.data.datasets[1].data = costeOpcion1_real_grafica.map((y, i) => ({
                    x: pacientesPorHoraGrafica[i],
                    y,
                }));
                myCostChart.current.data.datasets[2].data = costeOpcion2_fijo_grafica.map((y, i) => ({
                    x: pacientesPorHoraGrafica[i],
                    y,
                }));
                myCostChart.current.data.datasets[3].data = costeOpcion2_fijo_neto_grafica.map((y, i) => ({
                    x: pacientesPorHoraGrafica[i],
                    y,
                }));
                myCostChart.current.options.plugins.costIntersectionPlugin.piData = {
                    x: xCostIntersection,
                    y: yCostIntersection,
                };
                myCostChart.current.update();
            } else {
                // Plugin for intersection
                const costIntersectionPlugin = {
                    id: "costIntersectionPlugin",
                    piData: { x: xCostIntersection, y: yCostIntersection },
                    afterDraw: (chart) => {
                        const {
                            ctx,
                            chartArea: { bottom },
                            scales: { x, y },
                        } = chart;
                        const piX = chart.options.plugins.costIntersectionPlugin.piData.x;
                        const piY = chart.options.plugins.costIntersectionPlugin.piData.y;
                        ctx.save();
                        if (piX >= x.min && piX <= x.max) {
                            const xPos = x.getPixelForValue(piX);
                            const yPos = y.getPixelForValue(piY);
                            ctx.beginPath();
                            ctx.setLineDash([5, 5]);
                            ctx.strokeStyle = "rgba(0, 0, 0, 1)";
                            ctx.lineWidth = 1.5;
                            ctx.moveTo(xPos, yPos);
                            ctx.lineTo(xPos, bottom);
                            ctx.stroke();
                            ctx.beginPath();
                            ctx.arc(xPos, yPos, 5, 0, 2 * Math.PI);
                            ctx.fillStyle = "rgba(0, 0, 0, 1)";
                            ctx.fill();
                            ctx.fillStyle = "rgba(0, 0, 0, 1)";
                            ctx.textAlign = "center";
                            ctx.font = "12px Inter, sans-serif";
                            ctx.fillText(`PI (${piX.toFixed(4)})`, xPos, yPos - 15);
                        }
                        ctx.restore();
                    },
                };
                myCostChart.current = new Chart(costChartRef.current, {
                    type: "line",
                    data: {
                        labels: pacientesPorHoraGrafica,
                        datasets: [
                            {
                                label: `Opción 1: Coste para la empresa (pago al director)`,
                                data: costeOpcion1_coste_empresa.map((y, i) => ({
                                    x: pacientesPorHoraGrafica[i],
                                    y,
                                })),
                                borderColor: "#ffc107",
                                backgroundColor: "rgba(255, 193, 7, 0.4)",
                                borderWidth: 2,
                                fill: false,
                                tension: 0.1,
                                pointRadius: 0,
                            },
                            {
                                label: `Opción 1: Coste para la empresa (pago + cuota autónomo)`,
                                data: costeOpcion1_real_grafica.map((y, i) => ({
                                    x: pacientesPorHoraGrafica[i],
                                    y,
                                })),
                                borderColor: "#ffc107",
                                backgroundColor: "rgba(255, 193, 7, 0.4)",
                                borderWidth: 2,
                                fill: "-1",
                                tension: 0.1,
                                pointRadius: 0,
                            },
                            {
                                label: "Opción 2: Coste Bruto Total para la empresa",
                                data: costeOpcion2_fijo_grafica.map((y, i) => ({
                                    x: pacientesPorHoraGrafica[i],
                                    y,
                                })),
                                borderColor: "#a259ff",
                                backgroundColor: "rgba(162, 89, 255, 0.4)",
                                borderWidth: 2,
                                fill: false,
                                tension: 0.1,
                                pointRadius: 0,
                            },
                            {
                                label: "Opción 2: Coste Neto para la empresa (con deducciones)",
                                data: costeOpcion2_fijo_neto_grafica.map((y, i) => ({
                                    x: pacientesPorHoraGrafica[i],
                                    y,
                                })),
                                borderColor: "#a259ff",
                                backgroundColor: "rgba(162, 89, 255, 0.4)",
                                borderWidth: 2,
                                fill: "-1",
                                tension: 0.1,
                                pointRadius: 0,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: "top" },
                            title: { display: false },
                            costIntersectionPlugin: { piData: { x: xCostIntersection, y: yCostIntersection } },
                        },
                        scales: {
                            x: {
                                type: "linear",
                                min: 0,
                                max: 4,
                                title: { display: true, text: "Pacientes por Hora" },
                            },
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: "Coste Mensual en €" },
                            },
                        },
                    },
                    plugins: [costIntersectionPlugin],
                });
            }
        }

        // Chart.js: Profit Chart
        if (profitChartRef.current) {
            if (myProfitChart.current) {
                myProfitChart.current.data.labels = pacientesPorHoraGrafica;
                myProfitChart.current.data.datasets[0].data = beneficioOpcion1_solo_porcentaje_grafica.map((y, i) => ({
                    x: pacientesPorHoraGrafica[i],
                    y,
                }));
                myProfitChart.current.data.datasets[1].data = beneficioOpcion1_conAutonomo_grafica.map((y, i) => ({
                    x: pacientesPorHoraGrafica[i],
                    y,
                }));
                myProfitChart.current.data.datasets[2].data = beneficioOpcion2_grafica_bruto.map((y, i) => ({
                    x: pacientesPorHoraGrafica[i],
                    y,
                }));
                myProfitChart.current.data.datasets[3].data = beneficioOpcion2_grafica_neto.map((y, i) => ({
                    x: pacientesPorHoraGrafica[i],
                    y,
                }));
                myProfitChart.current.options.plugins.breakEvenPlugin.piData = {
                    op2: breakEvenValueOp2,
                    autonomo: breakEvenValueAutonomo,
                };
                myProfitChart.current.update();
            } else {
                // Plugin for break-even
                const breakEvenPlugin = {
                    id: "breakEvenPlugin",
                    piData: { op2: breakEvenValueOp2, autonomo: breakEvenValueAutonomo },
                    afterDraw: (chart) => {
                        const {
                            ctx,
                            chartArea: { bottom },
                            scales: { x, y },
                        } = chart;
                        const piOp2 = chart.options.plugins.breakEvenPlugin.piData.op2;
                        const piAutonomo = chart.options.plugins.breakEvenPlugin.piData.autonomo;
                        ctx.save();
                        const drawBreakEvenPoint = (xValue, color, label) => {
                            if (xValue >= x.min && xValue <= x.max) {
                                const xPos = x.getPixelForValue(xValue);
                                const yPos = y.getPixelForValue(0);
                                ctx.beginPath();
                                ctx.setLineDash([5, 5]);
                                ctx.strokeStyle = color;
                                ctx.lineWidth = 1.5;
                                ctx.moveTo(xPos, yPos);
                                ctx.lineTo(xPos, bottom);
                                ctx.stroke();
                                ctx.beginPath();
                                ctx.arc(xPos, yPos, 5, 0, 2 * Math.PI);
                                ctx.fillStyle = color;
                                ctx.fill();
                                ctx.fillStyle = color;
                                ctx.textAlign = "center";
                                ctx.font = "12px Inter, sans-serif";
                                ctx.fillText(label, xPos, yPos - 15);
                            }
                        };
                        drawBreakEvenPoint(piOp2, "#a259ff", `PE (${piOp2.toFixed(4)})`);
                        drawBreakEvenPoint(piAutonomo, "#ffc107", `PE (${piAutonomo.toFixed(4)})`);
                        ctx.restore();
                    },
                };
                myProfitChart.current = new Chart(profitChartRef.current, {
                    type: "line",
                    data: {
                        labels: pacientesPorHoraGrafica,
                        datasets: [
                            {
                                label: `Opción 1: Beneficio de la empresa (${porcentajeEmpresa}% ingresos)`,
                                data: beneficioOpcion1_solo_porcentaje_grafica.map((y, i) => ({
                                    x: pacientesPorHoraGrafica[i],
                                    y,
                                })),
                                borderColor: "#ffc107",
                                backgroundColor: "rgba(255, 193, 7, 0.4)",
                                borderWidth: 2,
                                fill: false,
                                tension: 0.1,
                                pointRadius: 0,
                            },
                            {
                                label: `Opción 1: Beneficio de la empresa (${porcentajeEmpresa}% + cuota autónomo)`,
                                data: beneficioOpcion1_conAutonomo_grafica.map((y, i) => ({
                                    x: pacientesPorHoraGrafica[i],
                                    y,
                                })),
                                borderColor: "#ffc107",
                                backgroundColor: "rgba(255, 193, 7, 0.4)",
                                borderWidth: 2,
                                fill: "-1",
                                tension: 0.1,
                                pointRadius: 0,
                            },
                            {
                                label: "Opción 2: Beneficio Bruto de la empresa",
                                data: beneficioOpcion2_grafica_bruto.map((y, i) => ({
                                    x: pacientesPorHoraGrafica[i],
                                    y,
                                })),
                                borderColor: "#a259ff",
                                backgroundColor: "rgba(162, 89, 255, 0.4)",
                                borderWidth: 2,
                                fill: false,
                                tension: 0.1,
                                pointRadius: 0,
                            },
                            {
                                label: "Opción 2: Beneficio Neto de la empresa (con deducciones)",
                                data: beneficioOpcion2_grafica_neto.map((y, i) => ({
                                    x: pacientesPorHoraGrafica[i],
                                    y,
                                })),
                                borderColor: "#a259ff",
                                backgroundColor: "rgba(162, 89, 255, 0.4)",
                                borderWidth: 2,
                                fill: "-1",
                                tension: 0.1,
                                pointRadius: 0,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { position: "top" },
                            title: { display: false },
                            breakEvenPlugin: { piData: { op2: breakEvenValueOp2, autonomo: breakEvenValueAutonomo } },
                        },
                        scales: {
                            x: {
                                type: "linear",
                                min: 0,
                                max: 4,
                                title: { display: true, text: "Pacientes por Hora" },
                            },
                            y: {
                                min: -2600,
                                title: { display: true, text: "Beneficio Mensual en €" },
                            },
                        },
                    },
                    plugins: [breakEvenPlugin],
                });
            }
        }
        // eslint-disable-next-line
    }, [inputs]);

    // Helper for formatting
    const formatNumber = (num) => `${num?.toFixed(2)} €`;

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
                <h1 className="text-4xl font-bold text-center text-blue-800 mb-6">
                    Análisis de Contratación del Director Médico
                </h1>
                <p className="text-center text-gray-600 mb-8">
                    Este documento compara el coste real para la empresa de dos opciones de contratación, basándonos en la actividad mensual de la clínica.
                </p>

                {/* Parámetros de la Simulación */}
                <div className="mb-8 p-6 bg-gray-50 rounded-xl shadow-inner">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Parámetros de la Simulación</h2>
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                        <div>
                            <label htmlFor="salarioInput" className="block text-sm font-medium text-gray-700">
                                Salario Bruto/Mes (€)
                            </label>
                            <input
                                type="number"
                                id="salarioInput"
                                value={inputs.salarioBruto}
                                min={minSalario}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="precioVisitaInput" className="block text-sm font-medium text-gray-700">
                                Precio/Paciente (€)
                            </label>
                            <input
                                type="number"
                                id="precioVisitaInput"
                                value={inputs.precioPaciente}
                                min={0}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="porcentajeEmpresaInput" className="block text-sm font-medium text-gray-700">
                                Porcentaje Empresa (%)
                            </label>
                            <input
                                type="number"
                                id="porcentajeEmpresaInput"
                                value={inputs.porcentajeEmpresa}
                                min={0}
                                max={100}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="cuotaAutonomoInput" className="block text-sm font-medium text-gray-700">
                                Cuota Autónomo (€)
                            </label>
                            <input
                                type="number"
                                id="cuotaAutonomoInput"
                                value={inputs.cuotaAutonomoBase}
                                min={0}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="deduccionFiscalEmpresaInput" className="block text-sm font-medium text-gray-700">
                                Deducción Fiscal Empresa (%)
                            </label>
                            <input
                                type="number"
                                id="deduccionFiscalEmpresaInput"
                                value={inputs.deduccionFiscalEmpresa}
                                min={0}
                                max={100}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                                onChange={handleInputChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="interesAnualInput" className="block text-sm font-medium text-gray-700">
                                Interés Anual (%)
                            </label>
                            <input
                                type="number"
                                id="interesAnualInput"
                                value={inputs.interesAnual}
                                min={0}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                    <button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors duration-200"
                        onClick={() => setInputs({ ...inputs })}
                    >
                        Recalcular
                    </button>
                    {message && (
                        <div className="mt-4 p-3 rounded-md text-sm text-center bg-red-100 text-red-700">{message}</div>
                    )}
                </div>

                {/* Opción 1: Autónomo Societario */}
                <div className="mb-8 p-6 bg-yellow-50 rounded-xl shadow-inner">
                    <h2 className="text-2xl font-bold text-yellow-700 mb-2">
                        Opción 1: Autónomo Societario (<span>{calc.porcentajeEmpresa}%</span> de la Empresa)
                    </h2>
                    <p className="text-gray-700">
                        En este escenario, la empresa recibe el <strong>{calc.porcentajeEmpresa}%</strong> de los ingresos por paciente, mientras que el director médico recibe el <strong>{calc.porcentajeAutonomo}%</strong>. El coste para la empresa es variable y depende del volumen de pacientes. Se considera que la empresa asume el coste del capital por la cuota de autónomo del médico.
                    </p>
                    <ul className="list-disc list-inside mt-4 text-gray-600">
                        <li>
                            <strong>Coste para la Empresa:</strong> El <span>{calc.porcentajeAutonomo}%</span> de los ingresos de cada paciente (ej: <span>{formatNumber(calc.precioPaciente)}</span>/paciente).
                        </li>
                        <li>
                            <strong>Cuota de Autónomo:</strong> El director médico asume su cuota de autónomo societario, que es de <strong>{formatNumber(calc.cuotaAutonomoBase)}</strong> al mes.
                        </li>
                        <li>
                            <strong>Coste con Interés:</strong> El coste total de la cuota de autónomo, aplicando un interés del <span>{inputs.interesAnual}</span>%, es de <strong>{formatNumber(calc.cuotaAutonomoConInteres)}</strong> al mes.
                        </li>
                    </ul>
                </div>

                {/* Opción 2: Contrato Laboral */}
                <div className="mb-8 p-6 bg-purple-50 rounded-xl shadow-inner">
                    <h2 className="text-2xl font-bold text-purple-700 mb-2">Opción 2: Contrato Laboral (Sueldo Fijo)</h2>
                    <p className="text-gray-700">
                        La empresa contrata al director médico en el Régimen General, manteniendo el 100% de la propiedad y el control. El coste es fijo e incluye el salario, la Seguridad Social y el coste del capital asociado al coste fijo.
                    </p>
                    <ul className="list-disc list-inside mt-4 text-gray-600">
                        <li>
                            <strong>Salario Base + SS:</strong> Salario bruto de <strong>{formatNumber(calc.salarioBruto)}</strong> más cotizaciones a la Seguridad Social de <strong>{formatNumber(calc.costeSeguridadSocial)}</strong>/mes.
                        </li>
                        <li>
                            <strong>Coste Bruto Total:</strong> El coste total de salario y SS, incluyendo el interés, es de <strong>{formatNumber(calc.costeBrutoTotalConInteres)}</strong>/mes.
                        </li>
                        <li>
                            <strong>Deducción Fiscal:</strong> El coste del interés es 100% deducible. La deducción fiscal del <span>{inputs.deduccionFiscalEmpresa}</span>% se aplica sobre las cotizaciones a la Seguridad Social, lo que supone un ahorro de <strong>{formatNumber(calc.deduccionMonto)}</strong>.
                        </li>
                        <li>
                            <strong>Coste Neto para la Empresa:</strong> El coste neto real es de <strong>{formatNumber(calc.costeNeto)}</strong> al mes.
                        </li>
                    </ul>
                </div>

                <hr className="my-8" />

                {/* Gráfica de Costos */}
                <div className="chart-container mb-12">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Comparativa de Costes Mensuales para la Empresa
                    </h2>
                    <canvas ref={costChartRef} className="bg-gray-50 rounded-xl p-4 shadow-md" />
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Análisis del Punto de Intersección (PI)</h3>
                        <p className="text-gray-700">
                            El punto de intersección (PI) de la gráfica de costes indica el nivel de actividad en el que el coste de la Opción 1 (autónomo) se iguala al coste de la Opción 2 (contrato laboral). Esto se calcula con el coste total de ambas opciones.
                        </p>
                        <ul className="list-disc list-inside mt-2 text-gray-600">
                            <li>
                                El PI se sitúa en <strong>{calc.xCostIntersection?.toFixed(4)}</strong> pacientes por hora, lo que equivale a <strong>{(calc.xCostIntersection * horasDia)?.toFixed(2)}</strong> pacientes al día o <strong>{(calc.xCostIntersection * horasTotalesMes)?.toFixed(2)}</strong> pacientes al mes. Esto es aproximadamente <strong>{formatTime(calc.xCostIntersection)}</strong>.
                            </li>
                            <li>
                                A partir de este punto, el coste para la empresa de la <strong>Opción 1</strong> (autónomo) es superior al coste de la <strong>Opción 2</strong> (contrato laboral).
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Gráfica de Beneficios */}
                <div className="chart-container">
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Comparativa de Beneficios Mensuales para la Empresa
                    </h2>
                    <canvas ref={profitChartRef} className="bg-gray-50 rounded-xl p-4 shadow-md" />
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">Análisis del Punto de Equilibrio (PE)</h3>
                        <p className="text-gray-700">
                            El punto de equilibrio (PE) de la gráfica de beneficios indica el nivel de actividad a partir del cual la empresa comienza a generar beneficios.
                        </p>
                        <ul className="list-disc list-inside mt-2 text-gray-600">
                            <li>
                                <strong>Opción 2 (Contrato Laboral):</strong> El PE se alcanza a los <strong>{calc.breakEvenValueOp2?.toFixed(4)}</strong> pacientes por hora, lo que equivale a aproximadamente <strong>{formatTime(calc.breakEvenValueOp2)}</strong>. A partir de aquí, el gasto fijo de sueldo y seguridad social se cubre con los ingresos.
                            </li>
                            <li>
                                <strong>Opción 1 (Autónomo):</strong> No hay un PE cuando el director asume la cuota de autónomo. Sin embargo, si la empresa asume la cuota de autónomo, el PE se sitúa en <strong>{calc.breakEvenValueAutonomo?.toFixed(4)}</strong> pacientes por hora, lo que equivale a aproximadamente <strong>{formatTime(calc.breakEvenValueAutonomo)}</strong>.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Tabla de Beneficios */}
                <div className="mt-10">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Tabla de Beneficios según la Actividad</h3>
                    <div className="overflow-x-auto rounded-lg shadow">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-700">Pacientes por Hora</th>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-700">Ingreso Total</th>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-700">Beneficio Opción 1</th>
                                    <th className="py-3 px-6 text-left font-semibold text-gray-700">Beneficio Opción 2</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calc.pacientesPorHoraTabla?.map((p, i) => (
                                    <tr key={p}>
                                        <td>{p}</td>
                                        <td>{formatNumber(calc.ingresoTotalTabla?.[i] || 0)}</td>
                                        <td>{formatNumber(calc.beneficioOpcion1_real_tabla?.[i] || 0)}</td>
                                        <td>{formatNumber(calc.beneficioOpcion2_fijo_neto_tabla?.[i] || 0)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resumen Conclusivo */}
                <hr className="my-8" />
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Resumen Conclusivo</h3>
                    <p className="text-gray-700 mb-2">
                        Para que la empresa no tenga pérdidas con la <strong>Opción 2 (Contrato Laboral)</strong>, el director debe visitar al menos un paciente cada <strong>{formatTime(calc.peOp2Tiempo)}</strong>.
                    </p>
                    <p className="text-gray-700">
                        El punto clave para decidir qué opción es mejor se encuentra en la actividad de la clínica. Si se visitan más de <strong>{calc.xCostIntersection?.toFixed(4)}</strong> pacientes por hora (es decir, al menos un paciente cada <strong>{formatTime(calc.xCostIntersection)}</strong>), la mejor opción para la empresa es el <strong>contrato laboral</strong>. En caso contrario, si la actividad es menor, la <strong>opción de autónomo</strong> es más rentable.
                    </p>
                </div>
            </div>
        </div>
    );
}
