import os
import sys
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage,
    KeepTogether, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

OUTPUT_DIR = r"c:\DEV\dev_ssoma"
PDF_PATH = os.path.join(OUTPUT_DIR, "Manual_Instalacion_y_Guia_Tecnica_SSOMA.pdf")
DIAG1_PATH = os.path.join(OUTPUT_DIR, "diag_arquitectura.png")
DIAG2_PATH = os.path.join(OUTPUT_DIR, "diag_despliegue_cloud.png")

# Fuentes TrueType de Windows
try:
    font_title = ImageFont.truetype("arialbd.ttf", 20)
    font_header = ImageFont.truetype("arialbd.ttf", 16)
    font_body = ImageFont.truetype("arial.ttf", 13)
    font_bold = ImageFont.truetype("arialbd.ttf", 13)
    font_badge = ImageFont.truetype("arialbd.ttf", 11)
except Exception:
    font_title = font_header = font_body = font_bold = font_badge = ImageFont.load_default()

# ==============================================================================
# 1. GENERACIÓN DE DIAGRAMAS TÉCNICOS VECTORIALES DE ALTA RESOLUCIÓN
# ==============================================================================
def create_diagram_architecture():
    w, h = 1200, 440
    img = Image.new('RGB', (w, h), color='#0B132B')
    draw = ImageDraw.Draw(img)

    # Rejilla suave
    for x in range(0, w, 40):
        draw.line([x, 0, x, h], fill='#121C38', width=1)
    for y in range(0, h, 40):
        draw.line([0, y, w, y], fill='#121C38', width=1)

    # Banner superior
    draw.rounded_rectangle([30, 20, 1170, 70], radius=12, fill='#1C2541', outline='#2D3D60', width=2)
    draw.text((50, 32), "ARQUITECTURA DEL SISTEMA SSOMA: FRONTEND SPA • BACKEND API • MYSQL", fill='#64DFDF', font=font_title)

    # BOX 1: CLIENTE (FRONTEND)
    b1_x1, b1_y1, b1_x2, b1_y2 = 40, 100, 380, 400
    draw.rounded_rectangle([b1_x1, b1_y1, b1_x2, b1_y2], radius=16, fill='#16223F', outline='#10B981', width=3)
    draw.rounded_rectangle([b1_x1, b1_y1, b1_x2, b1_y1 + 55], radius=12, fill='#10B981')
    draw.text((b1_x1 + 24, b1_y1 + 16), "CAPA CLIENTE (FRONTEND)", fill='#FFFFFF', font=font_header)
    
    f_items = [
        ("Framework:", "React 18 + Vite (SPA ultra rápida)"),
        ("Diseño:", "Vanilla CSS3 (Glassmorphism, Slate Navy)"),
        ("Iconografía:", "Lucide React (9 módulos temáticos)"),
        ("Estado Global:", "CompanyContext & AuthContext"),
        ("Gráficos:", "Spline Wave & Donut Chart (SVG)"),
        ("Regional:", "Simulador de Divisas & Separadores")
    ]
    for idx, (label, val) in enumerate(f_items):
        y_pos = b1_y1 + 75 + idx * 38
        draw.text((b1_x1 + 20, y_pos), label, fill='#34D399', font=font_bold)
        draw.text((b1_x1 + 20, y_pos + 16), val, fill='#E2E8F0', font=font_body)

    # BOX 2: BACKEND (REST API)
    b2_x1, b2_y1, b2_x2, b2_y2 = 460, 100, 800, 400
    draw.rounded_rectangle([b2_x1, b2_y1, b2_x2, b2_y2], radius=16, fill='#16223F', outline='#6366F1', width=3)
    draw.rounded_rectangle([b2_x1, b2_y1, b2_x2, b2_y1 + 55], radius=12, fill='#6366F1')
    draw.text((b2_x1 + 24, b2_y1 + 16), "CAPA SERVIDOR (BACKEND)", fill='#FFFFFF', font=font_header)

    b_items = [
        ("Framework:", "Node.js + Express REST API"),
        ("Seguridad:", "JWT (12h) & Bcryptjs (Cost 10)"),
        ("Payloads:", "JSON 50MB (Backups y Logotipos)"),
        ("Controladores:", "11 rutas modulares organizadas"),
        ("Motor DDL:", "Generador nativo de Dump y Restore"),
        ("Reseteo:", "Puesta a cero con reto de seguridad")
    ]
    for idx, (label, val) in enumerate(b_items):
        y_pos = b2_y1 + 75 + idx * 38
        draw.text((b2_x1 + 20, y_pos), label, fill='#818CF8', font=font_bold)
        draw.text((b2_x1 + 20, y_pos + 16), val, fill='#E2E8F0', font=font_body)

    # BOX 3: MYSQL DATABASE
    b3_x1, b3_y1, b3_x2, b3_y2 = 880, 100, 1170, 400
    draw.rounded_rectangle([b3_x1, b3_y1, b3_x2, b3_y2], radius=16, fill='#16223F', outline='#F59E0B', width=3)
    draw.rounded_rectangle([b3_x1, b3_y1, b3_x2, b3_y1 + 55], radius=12, fill='#F59E0B')
    draw.text((b3_x1 + 24, b3_y1 + 16), "BASE DE DATOS (MYSQL 8)", fill='#FFFFFF', font=font_header)

    d_items = [
        ("Base de Datos:", "dev_ssoma (13 tablas relacionales)"),
        ("Driver:", "mysql2/promise con Connection Pool"),
        ("Integridad:", "Foreign Keys ON DELETE CASCADE"),
        ("Empresas:", "Tabla configuracion_empresa"),
        ("Normativa:", "Enums Leve, Grave, Crítico, NTP"),
        ("Scripts:", "Auto-inicialización con init_db.js")
    ]
    for idx, (label, val) in enumerate(d_items):
        y_pos = b3_y1 + 75 + idx * 38
        draw.text((b3_x1 + 20, y_pos), label, fill='#FBBF24', font=font_bold)
        draw.text((b3_x1 + 20, y_pos + 16), val, fill='#E2E8F0', font=font_body)

    # Conectores y Flechas
    # 1. Frontend <-> Backend
    draw.line([380, 240, 460, 240], fill='#10B981', width=6)
    draw.polygon([(458, 240), (442, 230), (442, 250)], fill='#10B981')
    draw.polygon([(382, 240), (398, 230), (398, 250)], fill='#10B981')
    draw.rounded_rectangle([390, 195, 450, 225], radius=8, fill='#10B981')
    draw.text((398, 203), "HTTP REST", fill='#FFFFFF', font=font_badge)

    # 2. Backend <-> Database
    draw.line([800, 240, 880, 240], fill='#6366F1', width=6)
    draw.polygon([(878, 240), (862, 230), (862, 250)], fill='#6366F1')
    draw.polygon([(802, 240), (818, 230), (818, 250)], fill='#6366F1')
    draw.rounded_rectangle([810, 195, 870, 225], radius=8, fill='#6366F1')
    draw.text((818, 203), "TCP 3306", fill='#FFFFFF', font=font_badge)

    img.save(DIAG1_PATH)

def create_diagram_deployment():
    w, h = 1200, 380
    img = Image.new('RGB', (w, h), color='#0B132B')
    draw = ImageDraw.Draw(img)

    for x in range(0, w, 40):
        draw.line([x, 0, x, h], fill='#121C38', width=1)
    for y in range(0, h, 40):
        draw.line([0, y, w, y], fill='#121C38', width=1)

    # Banner superior
    draw.rounded_rectangle([30, 20, 1170, 70], radius=12, fill='#1C2541', outline='#2D3D60', width=2)
    draw.text((50, 32), "FLUJO DE DESPLIEGUE EN LA NUBE RECOMENDADO: RAILWAY MANAGED PLATFORM", fill='#A7F3D0', font=font_title)

    stages = [
        ("PASO 1: REPOSITORIO", [
            ("Código Local:", "Carpeta dev_ssoma"),
            ("Control:", "Git Version Control"),
            ("Servicio:", "GitHub / GitLab")
        ], '#10B981', 40),
        ("PASO 2: MYSQL CLOUD", [
            ("Aprovisionamiento:", "1 Clic Provision MySQL"),
            ("Conexión:", "Variables de red interna"),
            ("Migración:", "Ejecución de init_db.js")
        ], '#F59E0B', 330),
        ("PASO 3: BACKEND API", [
            ("Servicio Web:", "Node.js Express App"),
            ("Configuración:", "Inyección de variables .env"),
            ("Dominio API:", "https://api.up.railway.app")
        ], '#6366F1', 620),
        ("PASO 4: FRONTEND SPA", [
            ("Build Automático:", "npm run build (Vite)"),
            ("Variables:", "VITE_API_URL enlazada"),
            ("Dominio Web:", "https://ssoma.up.railway.app")
        ], '#EC4899', 910)
    ]

    for title, items, color, x_pos in stages:
        draw.rounded_rectangle([x_pos, 95, x_pos + 250, 350], radius=14, fill='#16223F', outline=color, width=3)
        draw.rounded_rectangle([x_pos, 95, x_pos + 250, 145], radius=10, fill=color)
        draw.text((x_pos + 20, 110), title, fill='#FFFFFF', font=font_header)
        for idx, (label, val) in enumerate(items):
            y_pos = 160 + idx * 55
            draw.text((x_pos + 16, y_pos), label, fill='#94A3B8', font=font_bold)
            draw.text((x_pos + 16, y_pos + 18), val, fill='#F8FAFC', font=font_body)

    for arrow_x in [295, 585, 875]:
        draw.line([arrow_x, 220, arrow_x + 30, 220], fill='#38BDF8', width=6)
        draw.polygon([(arrow_x + 30, 220), (arrow_x + 16, 210), (arrow_x + 16, 230)], fill='#38BDF8')

    img.save(DIAG2_PATH)

# ==============================================================================
# 2. CANVAS CON NUMERACIÓN "Página X de Y"
# ==============================================================================
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#0B132B"))

        # Cabecera
        self.drawString(40, 755, "SSOMA SUITE v2.0")
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(135, 755, "|  Manual Técnico, Instalación y Despliegue en la Nube")
        
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.8)
        self.line(40, 747, 572, 747)

        # Pie de página
        self.line(40, 42, 572, 42)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(40, 30, "Documento Oficial de Soporte TI y Operaciones SSOMA • Confidencial")
        
        page_str = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(572, 30, page_str)
        self.restoreState()

# ==============================================================================
# 3. ENSAMBLAJE DE CONTENIDOS DEL MANUAL
# ==============================================================================
def build_manual_pdf():
    create_diagram_architecture()
    create_diagram_deployment()

    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        leftMargin=38,
        rightMargin=38,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    c_primary = colors.HexColor("#0B132B")
    c_emerald = colors.HexColor("#10B981")
    c_indigo = colors.HexColor("#4F46E5")
    c_slate = colors.HexColor("#334155")
    c_muted = colors.HexColor("#64748B")

    style_title = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=c_primary,
        spaceAfter=6
    )

    style_subtitle = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=c_muted,
        spaceAfter=12
    )

    style_h1 = ParagraphStyle(
        'DocH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=c_primary,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    style_h2 = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=c_indigo,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    style_body = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_slate,
        spaceAfter=5
    )

    style_bullet = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=c_slate,
        leftIndent=10,
        spaceAfter=2
    )

    elements = []

    # ==========================================================================
    # PÁGINA 1: PORTADA & FICHA TÉCNICA & DIAGRAMA DE ARQUITECTURA
    # ==========================================================================
    elements.append(Spacer(1, 10))
    
    badge_table = Table([
        [Paragraph("<font color='#065F46'><b>DOCUMENTACIÓN OFICIAL • SSOMA SUITE v2.0 • ISO 45001 & ISO 14001</b></font>", styles['Normal'])]
    ], colWidths=[532])
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#D1FAE5")),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'CENTER')
    ]))
    elements.append(badge_table)
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("Manual de Arquitectura, Instalación Local y Despliegue en la Nube", style_title))
    elements.append(Paragraph("Sistema Web Integral de Seguridad, Salud Ocupacional y Gestión Ambiental", style_subtitle))
    elements.append(HRFlowable(width="100%", thickness=2.5, color=c_emerald, spaceAfter=14))

    summary_text = (
        "El presente documento técnico proporciona la guía integral para la administración, instalación local y puesta "
        "en producción en la nube de la plataforma web <b>SSOMA Suite</b>. Desarrollada para gestionar de manera centralizada "
        "la prevención de accidentes, inspecciones, matrices IPERC, huella ambiental, formación de brigadas y contingencias, "
        "respaldos completos de bases de datos y personalización corporativa multimoneda."
    )
    elements.append(Paragraph(summary_text, style_body))
    elements.append(Spacer(1, 10))

    meta_data = [
        [Paragraph("<b>Componente</b>", style_body), Paragraph("<b>Especificación / Detalle</b>", style_body)],
        [Paragraph("<b>Frontend:</b>", style_body), Paragraph("React 18.3, Vite 8, CSS3 Vanilla Design System, Lucide Icons, Context API", style_body)],
        [Paragraph("<b>Backend:</b>", style_body), Paragraph("Node.js, Express REST API, JWT (12h), Bcryptjs, Motor Nativo DDL de Respaldos", style_body)],
        [Paragraph("<b>Base de Datos:</b>", style_body), Paragraph("MySQL 8.0 / MariaDB 10+ (13 tablas relacionales con restricciones foráneas)", style_body)],
        [Paragraph("<b>Normativas Integradas:</b>", style_body), Paragraph("Ley N° 29783, D.S. 005-2012-TR, ISO 45001:2018, ISO 14001:2015, NTP 900.058:2019", style_body)],
        [Paragraph("<b>Entorno Local:</b>", style_body), Paragraph("Node v18+, MySQL 8.0 / XAMPP, Puerto 5000 (Backend API) y 5173 (Frontend Web)", style_body)],
        [Paragraph("<b>Hosting Sugerido:</b>", style_body), Paragraph("Railway.app (PaaS Unificado #1) / Render.com / VPS Cloud Dedicado", style_body)]
    ]
    meta_table = Table(meta_data, colWidths=[150, 382])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0B132B")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F8FAFC"), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 14))

    elements.append(Paragraph("<b>DIAGRAMA 1: ARQUITECTURA GENERAL DEL SISTEMA CLIENTE - SERVIDOR</b>", style_h2))
    elements.append(RLImage(DIAG1_PATH, width=532, height=185))

    elements.append(PageBreak())

    # ==========================================================================
    # PÁGINA 2: SECCIÓN 1 (TECNOLOGÍAS) & SECCIÓN 2 (CATÁLOGO FUNCIONAL 1-5)
    # ==========================================================================
    elements.append(Paragraph("1. Tecnologías de Desarrollo y Stack Tecnológico", style_h1))
    elements.append(Paragraph(
        "La plataforma fue desarrollada con tecnologías robustas, modernas y de código abierto sin dependencias propietarias:",
        style_body
    ))

    tech_data = [
        [Paragraph("<b>Capa</b>", style_body), Paragraph("<b>Tecnología</b>", style_body), Paragraph("<b>Versión / Librerías</b>", style_body), Paragraph("<b>Propósito en el Sistema</b>", style_body)],
        [
            Paragraph("<b>Frontend</b>", style_body),
            Paragraph("React.js + Vite", style_body),
            Paragraph("React 18.3, Vite 8.3, Lucide-React", style_body),
            Paragraph("Interfaz SPA reactiva, componentes modulares, gráficos SVG interactivos y renderizado inmediato sin recarga.", style_body)
        ],
        [
            Paragraph("<b>Diseño & Estilos</b>", style_body),
            Paragraph("Vanilla CSS3", style_body),
            Paragraph("CSS Variables, Flexbox, Grid, Glassmorphism", style_body),
            Paragraph("Diseño corporativo en paleta Slate/Navy (#0B132B), tarjetas redondeadas a 18px, microinteracciones y modo oscuro en sidebar.", style_body)
        ],
        [
            Paragraph("<b>Backend</b>", style_body),
            Paragraph("Node.js + Express", style_body),
            Paragraph("Express 4.19, dotenv, cors, bcryptjs, jsonwebtoken", style_body),
            Paragraph("API REST modular con 11 rutas independientes, manejo de sesiones seguras vía JWT (12h) y contraseñas hasheadas en sal 10.", style_body)
        ],
        [
            Paragraph("<b>Base de Datos</b>", style_body),
            Paragraph("MySQL Relacional", style_body),
            Paragraph("MySQL 8.0, mysql2/promise (Connection Pool)", style_body),
            Paragraph("13 tablas normalizadas con claves foráneas, restricciones de integridad referencial, enums de severidad y respaldos DDL nativos.", style_body)
        ]
    ]
    t_tech = Table(tech_data, colWidths=[70, 95, 130, 237])
    t_tech.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E293B")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F8FAFC"), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'TOP')
    ]))
    elements.append(t_tech)
    elements.append(Spacer(1, 10))

    elements.append(Paragraph("2. Catálogo Funcional de Módulos Operativos (Parte I)", style_h1))
    
    feat_part1 = [
        ("1. Dashboard Ejecutivo & KPIs en Tiempo Real", 
         "4 tarjetas en gradientes cromáticos (Días sin accidentes, Incidentes del mes, Cumplimiento de inspecciones, Residuos gestionados), "
         "gráfico Spline de evolución anual interactivo con tooltips, tabla de eventos recientes con avatares de trabajadores y velocímetro Donut de nivel de riesgo."),
        
        ("2. Gestión de Incidentes & Accidentes", 
         "Registro con cálculo de días perdidos, costos asociados, causa raíz y plan de acción. Filtros por severidad (Leve, Moderado, Grave, Crítico) "
         "y estado (Reportado, En Investigación, Plan de Acción, Cerrado) con actualización dinámica vía PATCH."),
        
        ("3. Inspecciones de Seguridad & Hallazgos Subestándar", 
         "Programación y control de inspecciones de campo (5S, extintores, izaje, equipos). Semáforo de cumplimiento porcentual y ventana modal "
         "para visualización y levantamiento de hallazgos (condiciones y actos subestándar)."),
        
        ("4. Matriz IPERC Continuo (5x5)", 
         "Evaluación matricial de Probabilidad x Severidad con categorización semántica automática (Bajo, Medio, Alto, Crítico) "
         "y asignación según la Jerarquía de Controles (Eliminación, Sustitución, Controles de Ingeniería, Administrativos, EPP)."),
        
        ("5. Gestión Ambiental & Residuos Sólidos", 
         "Submódulo 1: Control de residuos con código normativo de colores (NTP 900.058), pesajes en kg y trazabilidad hacia operadores EO-RS. "
         "Submódulo 2: Monitoreo ambiental de Ruido (dB), Partículas (PM10/PM2.5), Gases (CO) y Efluentes (pH/DBO5) contrastados con Límites Máximos Permisibles (LMP).")
    ]
    for f_title, f_desc in feat_part1:
        elements.append(Paragraph(f"<b>{f_title}</b>", style_h2))
        elements.append(Paragraph(f_desc, style_body))

    elements.append(PageBreak())

    # ==========================================================================
    # PÁGINA 3: SECCIÓN 2 (CATÁLOGO FUNCIONAL 6-10)
    # ==========================================================================
    elements.append(Paragraph("2. Catálogo Funcional de Módulos Operativos (Parte II)", style_h1))

    feat_part2 = [
        ("6. Capacitaciones & Horas-Hombre (HH)", 
         "Cálculo automático de Horas-Hombre de formación (HH = duración x participantes), control de asistencia de personal, cobertura institucional "
         "y cumplimiento de las 4 capacitaciones mínimas anuales exigidas por la Ley 29783."),
        
        ("7. Control de Equipos de Protección Personal (EPP)", 
         "Kardex de inventario de EPP con alertas automáticas de stock mínimo. Registro de Actas de Entrega firmadas digitalmente por trabajador con descuento automático de almacén."),
        
        ("8. Directorio de Personal & Áreas Operativas", 
         "Censo de trabajadores con DNI, cargo, área y badge de Aptitud Médica Ocupacional. Mapeo de áreas de la empresa con conteo en vivo de trabajadores y siniestralidad acumulada."),
        
        ("9. Copias de Seguridad, Restauración y Puesta a Cero (Reset)", 
         "• <b>Backup con 1 clic:</b> Genera y descarga un archivo .json estructurado con el volcado completo de las 13 tablas relacionales y su DDL.<br/>"
         "• <b>Restauración Asistida:</b> Carga de archivo de respaldo con análisis de metadatos y restauración transaccional íntegra.<br/>"
         "• <b>Puesta a Cero (Reset):</b> Vaciado seguro de tablas operacionales para entrega a una nueva empresa, exigiendo el reto de seguridad 'CONFIRMAR RESET'."),
        
        ("10. Configuración de Empresa, Logotipo & Formatos Regionales", 
         "• <b>Datos Corporativos:</b> Razón Social, RUC, Dirección, Teléfono, Correo, Representante Legal y Responsable SSOMA.<br/>"
         "• <b>Gestor de Logotipo:</b> Carga de imagen local (Base64), URL externa o selector de presets industriales, reflejado en el Sidebar y Header.<br/>"
         "• <b>Moneda y Formato:</b> Configuración de divisa (S/., $, €, etc.), separador decimal (. o ,), separador de miles y simulador financiero en vivo.<br/>"
         "• <b>Informe Mensual PDF:</b> Exportador ejecutivo para impresión o descarga con datos y membrete de la empresa activa.")
    ]
    for f_title, f_desc in feat_part2:
        elements.append(Paragraph(f"<b>{f_title}</b>", style_h2))
        elements.append(Paragraph(f_desc, style_body))

    elements.append(PageBreak())

    # ==========================================================================
    # PÁGINA 4: SECCIÓN 3 (INSTALACIÓN LOCAL PASO A PASO)
    # ==========================================================================
    elements.append(Paragraph("3. Guía Paso a Paso para Instalar el Sistema en una PC Nueva", style_h1))
    elements.append(Paragraph(
        "Siga estas instrucciones detalladas para instalar y ejecutar el sistema desde cero en una máquina con Windows, Linux o macOS:",
        style_body
    ))

    elements.append(Paragraph("A. Software que Debe Descargar e Instalar Previamente", style_h2))
    soft_data = [
        [Paragraph("<b>Software</b>", style_body), Paragraph("<b>Versión Sugerida</b>", style_body), Paragraph("<b>Enlace Oficial de Descarga</b>", style_body), Paragraph("<b>Función</b>", style_body)],
        [
            Paragraph("<b>Node.js (LTS)</b>", style_body),
            Paragraph("v18.x o v20.x LTS", style_body),
            Paragraph("<font color='#4F46E5'><u>https://nodejs.org/</u></font>", style_body),
            Paragraph("Entorno de ejecución para el Backend Express y gestor npm.", style_body)
        ],
        [
            Paragraph("<b>MySQL Server</b> o <b>XAMPP</b>", style_body),
            Paragraph("MySQL 8.0+ / MariaDB 10+", style_body),
            Paragraph("<font color='#4F46E5'><u>https://dev.mysql.com/downloads/</u></font><br/><font color='#4F46E5'><u>https://www.apachefriends.org/</u></font>", style_body),
            Paragraph("Servidor de base de datos relacional en localhost:3306.", style_body)
        ],
        [
            Paragraph("<b>Git</b>", style_body),
            Paragraph("Versión actual", style_body),
            Paragraph("<font color='#4F46E5'><u>https://git-scm.com/downloads</u></font>", style_body),
            Paragraph("Control de versiones para clonar o descargar el código.", style_body)
        ],
        [
            Paragraph("<b>VS Code</b> (Opcional)", style_body),
            Paragraph("Versión actual", style_body),
            Paragraph("<font color='#4F46E5'><u>https://code.visualstudio.com/</u></font>", style_body),
            Paragraph("Editor de código recomendado para editar o depurar.", style_body)
        ]
    ]
    t_soft = Table(soft_data, colWidths=[90, 95, 165, 182])
    t_soft.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0B132B")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F8FAFC"), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE')
    ]))
    elements.append(t_soft)
    elements.append(Spacer(1, 8))

    elements.append(Paragraph("B. Procedimiento Paso a Paso de Puesta en Marcha", style_h2))

    local_steps = [
        ("Paso 1: Iniciar el Servidor de Base de Datos MySQL",
         "Asegúrese de que MySQL esté activo en el puerto 3306. Si utiliza XAMPP, abra el panel y haga clic en <b>Start</b> junto a MySQL."),
        
        ("Paso 2: Copiar o Clonar la Carpeta del Proyecto",
         "Coloque la carpeta del proyecto en su disco duro (por ejemplo, en <code>C:\\DEV\\dev_ssoma</code>)."),
        
        ("Paso 3: Configurar Variables de Entorno del Backend (.env)",
         "En la carpeta <code>backend/</code>, verifique el archivo <code>.env</code> con sus credenciales locales:<br/>"
         "<code>DB_HOST=localhost | DB_USER=root | DB_PASSWORD= | DB_PORT=3306 | DB_NAME=dev_ssoma | PORT=5000</code>"),
        
        ("Paso 4: Instalar Dependencias del Backend",
         "Abra una terminal en <code>backend/</code> y ejecute: <code>npm install</code>"),
        
        ("Paso 5: Inicializar la Base de Datos Automáticamente",
         "Ejecute: <code>node scripts/init_db.js</code> <i>(Creará las 13 tablas relacionales y cargará los datos semilla iniciales).</i>"),
        
        ("Paso 6: Instalar Dependencias del Frontend",
         "Abra una segunda terminal en <code>frontend/</code> y ejecute: <code>npm install</code>"),
        
        ("Paso 7: Levantar los Servidores y Acceder",
         "• Terminal 1 (Backend): <code>node server.js</code> <i>(Servidor en https://ssoma-app-fbwe.onrender.com)</i><br/>"
         "• Terminal 2 (Frontend): <code>npm run dev</code> <i>(Aplicación en http://localhost:5173)</i>"),
        
        ("Paso 8: Credenciales de Acceso Demostrativas",
         "• <b>Jefe SSOMA (Admin):</b> admin@ssoma.com | Contraseña: <b>admin123</b><br/>"
         "• <b>Supervisora de Campo:</b> supervisor@ssoma.com | Contraseña: <b>admin123</b><br/>"
         "• <b>Auditora ISO:</b> auditor@ssoma.com | Contraseña: <b>admin123</b>")
    ]

    for s_title, s_desc in local_steps:
        elements.append(Paragraph(f"<b>{s_title}</b>", style_h2))
        elements.append(Paragraph(s_desc, style_bullet))

    elements.append(PageBreak())

    # ==========================================================================
    # PÁGINA 5: SECCIÓN 4 (HOSTING WEB SUGERIDO) & SECCIÓN 5 (PASO A PASO EN RAILWAY)
    # ==========================================================================
    elements.append(Paragraph("4. Opciones de Hosting Web Sugeridas & Comparativa", style_h1))
    elements.append(Paragraph(
        "Al tratarse de una arquitectura completa con Frontend SPA, API Backend y MySQL relacional, se evalúan las mejores opciones:",
        style_body
    ))

    hosting_data = [
        [Paragraph("<b>Plataforma</b>", style_body), Paragraph("<b>Ventajas Principales</b>", style_body), Paragraph("<b>MySQL Incluido</b>", style_body), Paragraph("<b>Dificultad</b>", style_body), Paragraph("<b>Veredicto</b>", style_body)],
        [
            Paragraph("<b>Railway.app</b>", style_body),
            Paragraph("Despliegue unificado de MySQL, Node.js y React en un solo proyecto. Variables automáticas, SSL gratuito y cero configuración de servidores.", style_body),
            Paragraph("Sí (Managed MySQL 8.0 con backups)", style_body),
            Paragraph("Muy Fácil", style_body),
            Paragraph("<b>RECOMENDADO (#1)</b>", style_body)
        ],
        [
            Paragraph("<b>Render.com</b>", style_body),
            Paragraph("Web Services para Node.js y Static Sites para React. Interfaz limpia y buen soporte.", style_body),
            Paragraph("Requiere plan de pago", style_body),
            Paragraph("Fácil", style_body),
            Paragraph("Buena alternativa", style_body)
        ],
        [
            Paragraph("<b>Vercel + Railway</b>", style_body),
            Paragraph("Frontend en el Edge de Vercel y Backend/MySQL en Railway. Velocidad global de CDN.", style_body),
            Paragraph("Vía Railway", style_body),
            Paragraph("Intermedio", style_body),
            Paragraph("Para alto tráfico", style_body)
        ],
        [
            Paragraph("<b>VPS Cloud (DigitalOcean)</b>", style_body),
            Paragraph("Control de infraestructura total, Docker, Nginx reverse proxy y base de datos privada.", style_body),
            Paragraph("Instalación manual", style_body),
            Paragraph("Avanzado", style_body),
            Paragraph("Para TI dedicada", style_body)
        ]
    ]

    t_host = Table(hosting_data, colWidths=[85, 195, 92, 70, 94])
    t_host.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#0B132B")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#F8FAFC"), colors.white]),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
        ('PADDING', (0,0), (-1,-1), 3),
        ('VALIGN', (0,0), (-1,-1), 'TOP')
    ]))
    elements.append(t_host)
    elements.append(Spacer(1, 6))

    elements.append(Paragraph("5. Guía Paso a Paso para Desplegar en Railway.app (Recomendado)", style_h1))
    elements.append(Paragraph(
        "<b>Railway</b> es la opción más recomendada porque permite alojar en un único panel la Base de Datos MySQL, el Backend Node y el Frontend React con SSL automático:",
        style_body
    ))
    elements.append(Spacer(1, 3))

    elements.append(Paragraph("<b>DIAGRAMA 2: ARQUITECTURA DE DESPLIEGUE CONTINUO EN LA NUBE</b>", style_h2))
    elements.append(RLImage(DIAG2_PATH, width=536, height=128))
    elements.append(Spacer(1, 4))

    cloud_steps = [
        ("Paso 1: Cuenta en Railway y Subir Código a GitHub",
         "Regístrese en <font color='#4F46E5'><u>https://railway.app</u></font> con su cuenta de GitHub y suba el repositorio de su proyecto."),
        
        ("Paso 2: Aprovisionar Base de Datos MySQL",
         "En Railway Dashboard: <b>+ New Project</b> > <b>Provision MySQL</b>. Railway creará el servidor con credenciales automáticas."),
        
        ("Paso 3: Inicializar las Tablas en la Nube",
         "En su <code>backend/.env</code> local, coloque temporalmente los datos de conexión de Railway y ejecute <code>node scripts/init_db.js</code> (o use el módulo web Restaurar Backup)."),
        
        ("Paso 4: Desplegar el Backend Express",
         "En el mismo proyecto de Railway: <b>+ New Service</b> > <b>GitHub Repo</b>. En Settings configure <i>Root Directory:</i> <code>backend</code> y <i>Start Command:</i> <code>node server.js</code>. Vincule las variables de MySQL y active <b>Generate Domain</b> para obtener su URL API HTTPS."),
        
        ("Paso 5: Desplegar el Frontend React",
         "En el proyecto: <b>+ New Service</b> > <b>GitHub Repo</b>. Configure <i>Root Directory:</i> <code>frontend</code> y variable <code>VITE_API_URL</code> apuntando a la URL del backend. Active <b>Generate Domain</b> para publicar su aplicación web."),
        
        ("Paso 6: Dominio Propio y Certificado SSL (Opcional)",
         "En <b>Custom Domain</b> puede enlazar su dominio institucional (ej. <code>ssoma.miempresa.com</code>) con certificado SSL automático.")
    ]

    for cs_title, cs_desc in cloud_steps:
        elements.append(Paragraph(f"<b>{cs_title}</b>", style_h2))
        elements.append(Paragraph(cs_desc, style_bullet))

    doc.build(elements, canvasmaker=NumberedCanvas)
    print(f"[OK] Documento PDF optimizado generado exitosamente en: {PDF_PATH}")

if __name__ == "__main__":
    build_manual_pdf()
