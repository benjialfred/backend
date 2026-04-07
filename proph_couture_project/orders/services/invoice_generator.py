import os
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from django.conf import settings
from django.utils import timezone

class InvoiceGenerator:
    """PDF Invoice Generator for Proph Couture Orders."""
    
    @staticmethod
    def generate(order):
        """Generates a PDF bytes buffer for the given order."""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer, 
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        elements = []
        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            'TitleStyle', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=22, 
            textColor=colors.HexColor('#0A0A0A'), alignment=1, spaceAfter=20
        )
        subtitle_style = ParagraphStyle(
            'SubtitleStyle', parent=styles['Normal'], fontName='Helvetica', fontSize=10, 
            textColor=colors.gray, alignment=1, spaceAfter=30
        )
        normal_style = styles['Normal']
        bold_style = ParagraphStyle('BoldStyle', parent=styles['Normal'], fontName='Helvetica-Bold')

        # Header - Logo (optional) and Company Info
        # You would typically add a real path to your logo here if available on backend
        # logo_path = os.path.join(settings.BASE_DIR, 'static', 'assets', 'phc_logo.jpg')
        # if os.path.exists(logo_path):
        #    im = Image(logo_path, width=4*cm, height=4*cm)
        #    im.hAlign = 'CENTER'
        #    elements.append(im)
        
        elements.append(Paragraph("PROPH COUTURE", title_style))
        elements.append(Paragraph("L'élégance du style camerounais, la précision du sur-mesure", subtitle_style))
        
        # Order Info Table
        order_info = [
            [Paragraph("<b>FACTURE N°:</b>", normal_style), Paragraph(order.order_number, normal_style),
             Paragraph("<b>DATE:</b>", normal_style), Paragraph(order.created_at.strftime('%d/%m/%Y'), normal_style)],
            [Paragraph("<b>CLIENT:</b>", normal_style), Paragraph(order.user.get_full_name() if order.user else 'Client Anonyme', normal_style),
             Paragraph("<b>STATUT:</b>", normal_style), Paragraph(order.get_status_display(), normal_style)]
        ]
        
        t_info = Table(order_info, colWidths=[3*cm, 5.5*cm, 2.5*cm, 5.5*cm])
        t_info.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ]))
        elements.append(t_info)
        elements.append(Spacer(1, 1*cm))

        # Items Table
        data = [['Article', 'Prix Unitaire', 'Qté', 'Total']]
        for item in order.items.all():
            data.append([
                Paragraph(item.product.nom if item.product else 'Produit inconnu', normal_style),
                f"{item.product_price} XAF",
                str(item.quantity),
                f"{item.product_price * item.quantity} XAF"
            ])

        # Subtotals and Totals
        data.append(['', '', 'Sous-total:', f"{order.subtotal} XAF"])
        data.append(['', '', 'Frais de port:', f"{order.shipping_cost} XAF"])
        data.append(['', '', 'TOTAL:', f"{order.total_amount} XAF"])

        t_items = Table(data, colWidths=[8*cm, 3.5*cm, 1.5*cm, 3.5*cm])
        t_items.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#F3F4F6')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.HexColor('#111827')),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('ALIGN', (1,0), (-1,-1), 'RIGHT'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 10),
            ('BOTTOMPADDING', (0,0), (-1,0), 12),
            ('TOPPADDING', (0,0), (-1,0), 12),
            ('GRID', (0,0), (-1,-4), 1, colors.HexColor('#E5E7EB')),
            # Formatting the totals rows
            ('LINEABOVE', (-2, -3), (-1, -1), 1, colors.black),
            ('FONTNAME', (-2, -1), (-1, -1), 'Helvetica-Bold'),
        ]))
        elements.append(t_items)
        elements.append(Spacer(1, 2*cm))

        # Footer Notes
        elements.append(Paragraph("<b>MERCI DE VOTRE CONFIANCE !</b>", ParagraphStyle('CenterBold', parent=styles['Normal'], alignment=1, fontName='Helvetica-Bold')))
        elements.append(Spacer(1, 0.5*cm))
        elements.append(Paragraph("Pour toute question concernant cette facture, veuillez nous contacter à contact@prophcouture.com", ParagraphStyle('Small', parent=styles['Normal'], fontSize=8, alignment=1, textColor=colors.gray)))

        doc.build(elements)
        buffer.seek(0)
        return buffer
