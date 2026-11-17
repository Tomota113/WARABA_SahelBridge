#!/usr/bin/env python3
"""Validation XML et aperçu sans navigateur, avec les bibliothèques système.

Usage : python plans/valider_rendu.py
Librsvg/Cairo produisent des aperçus PNG et un PDF A3 vectoriel, dans plans/.
Libxml2 est le moteur XML de xmllint, utilisé ici si son exécutable est absent.
"""
import ctypes as c
import ctypes.util
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent


def library(name):
    path = ctypes.util.find_library(name)
    if not path:
        raise RuntimeError(f"Bibliothèque système manquante : {name}")
    return c.CDLL(path)


def api(lib, name, result, *args):
    f = getattr(lib, name)
    f.restype = result
    f.argtypes = list(args)
    return f


xml = library('xml2')
read_xml = api(xml, 'xmlReadFile', c.c_void_p, c.c_char_p, c.c_char_p, c.c_int)
free_xml = api(xml, 'xmlFreeDoc', None, c.c_void_p)
rsvg, cairo, gobject = library('rsvg-2'), library('cairo'), library('gobject-2.0')
new_svg = api(rsvg, 'rsvg_handle_new_from_file', c.c_void_p, c.c_char_p, c.c_void_p)
set_dpi = api(rsvg, 'rsvg_handle_set_dpi', None, c.c_void_p, c.c_double)
unref = api(gobject, 'g_object_unref', None, c.c_void_p)
create_image = api(cairo, 'cairo_image_surface_create', c.c_void_p, c.c_int, c.c_int, c.c_int)
create_pdf = api(cairo, 'cairo_pdf_surface_create', c.c_void_p, c.c_char_p, c.c_double, c.c_double)
create_context = api(cairo, 'cairo_create', c.c_void_p, c.c_void_p)
destroy_context = api(cairo, 'cairo_destroy', None, c.c_void_p)
destroy_surface = api(cairo, 'cairo_surface_destroy', None, c.c_void_p)
finish_surface = api(cairo, 'cairo_surface_finish', None, c.c_void_p)
surface_status = api(cairo, 'cairo_surface_status', c.c_int, c.c_void_p)
write_png = api(cairo, 'cairo_surface_write_to_png', c.c_int, c.c_void_p, c.c_char_p)


class Rectangle(c.Structure):
    _fields_ = [('x', c.c_double), ('y', c.c_double), ('width', c.c_double), ('height', c.c_double)]


render = api(rsvg, 'rsvg_handle_render_document', c.c_int, c.c_void_p, c.c_void_p, c.POINTER(Rectangle), c.c_void_p)
preview = ROOT / 'apercus'
preview.mkdir(exist_ok=True)
for path in sorted((ROOT / 'svg').glob('*.svg')):
    doc = read_xml(str(path).encode(), None, 2048)  # XML_PARSE_NONET
    if not doc:
        raise RuntimeError(f"XML invalide : {path}")
    free_xml(doc)
    tree = ET.parse(path)
    ids = [el.attrib['id'] for el in tree.iter() if 'id' in el.attrib]
    assert len(ids) == len(set(ids)), f"Identifiants SVG dupliqués : {path}"
    for el in tree.iter():
        for value in el.attrib.values():
            if value.startswith('url(#'):
                assert value[5:-1] in ids, (path, value)
    width, height = map(float, tree.getroot().attrib['viewBox'].split()[2:])
    handle = new_svg(str(path).encode(), None)
    assert handle, f"SVG non rendu : {path}"
    set_dpi(handle, 96)
    pixels_per_mm = 5
    surface = create_image(0, round(width * pixels_per_mm), round(height * pixels_per_mm))
    cr = create_context(surface)
    viewport = Rectangle(0, 0, width * pixels_per_mm, height * pixels_per_mm)
    assert render(handle, cr, c.byref(viewport), None), f"Échec rendu {path}"
    output = preview / (path.stem + '.png')
    assert write_png(surface, str(output).encode()) == 0
    destroy_context(cr)
    destroy_surface(surface)
    if path.stem == 'planche_A3':
        points_per_mm = 72 / 25.4
        surface = create_pdf(str(ROOT / 'planche_A3.pdf').encode(), width * points_per_mm, height * points_per_mm)
        cr = create_context(surface)
        viewport = Rectangle(0, 0, width * points_per_mm, height * points_per_mm)
        assert render(handle, cr, c.byref(viewport), None)
        destroy_context(cr)
        finish_surface(surface)
        assert surface_status(surface) == 0
        destroy_surface(surface)
    unref(handle)
    print(f"XML libxml2 + références SVG + rendu : {path.relative_to(ROOT)} OK")
print('Aperçus dans plans/apercus/ ; plans/planche_A3.pdf : A3 vectoriel, sans navigateur.')
