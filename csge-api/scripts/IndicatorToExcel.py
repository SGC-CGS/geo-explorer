# -*- coding: utf-8 -*-
# Output the selected indicator in the selected language to a XLSX file.

import arcpy
import os
import sys

# To allow overwriting the outputs change the overwrite option to true.
arcpy.env.overwriteOutput = True

# Set Geoprocessing environments
scratch_path = arcpy.env.scratchGDB

# Database connection
script_path = sys.path[0]
one_folder_up = os.path.dirname(script_path)
csge_sde = os.path.join(one_folder_up, "Data", "CSGE.sde")

def field_map_from_dict(input_dataset, map_dict):
    # field mappings for selecting and reordering columns
    field_mappings = arcpy.FieldMappings() 
    
    for source_field in map_dict:
        field_map = arcpy.FieldMap()
        field_map.addInputField(input_dataset, source_field)
        output_field = field_map.outputField
        output_field.name = map_dict[source_field]
        field_map.outputField = output_field
        field_mappings.addFieldMap(field_map)
        
    return field_mappings
    
    
def prepare_dguids(dguids):
    # dguids are comma separated, strip any space,",' and add single quotes 
    # this may not be necessary if dguids are coming in properly formatted
    dguids = dguids.replace('"', '').replace("'", "").replace(" ", "") 
    dguid_list = dguids.split(',') # convert to list
    
    quoted_dguids = str(dguid_list)[1:-1] # convert to quoted comma sep string
    
    return quoted_dguids
    

def indicator_to_excel(OutputXLSX, IndicatorID, Language, DGUIDs):

    # prepare DGUIDs if present
    dguid_str = prepare_dguids(DGUIDs)

    # Get Primary Query from DB
    pq_rows = arcpy.TableSelect_analysis(
        in_table=os.path.join(csge_sde, "STC_DV.gis.IndicatorMetaData"), 
        out_table=os.path.join(scratch_path, "ind_sel"), 
        where_clause="IndicatorId = " + IndicatorID)
       
    # Retrieve first row value of PrimaryQuery column
    pq_query_str = ""
    with arcpy.da.SearchCursor(pq_rows, ["PrimaryQuery"]) as cursor:
        for row in cursor:
            pq_query_str = row[0]
            # if we have the primary query, add any DGUIDs requested
            if DGUIDs != "":
                pq_query_str += " WHERE grfi.GeographyReferenceID IN (" + dguid_str + ") "
            
    # Make Query Layer from result of primary query - results in feature layer
    sr = arcpy.SpatialReference(3857) # WGS_1984_Web_Mercator_Auxiliary_Sphere
    all_polys = arcpy.MakeQueryLayer_management(input_database=csge_sde, 
        out_layer_name=os.path.join(scratch_path, "all_polys.shp"), 
        query=pq_query_str, oid_fields="GeographyReferenceID", 
        shape_type="POLYGON", spatial_reference=sr)
        
    # turn query layer into feature layer (required for hiding fields in output)
    copied_lyr = os.path.join(scratch_path, "copied_lyr")
    feat_lyr = os.path.join(scratch_path, "feat_lyr")
    arcpy.CopyFeatures_management(all_polys, copied_lyr) # saves results
    arcpy.management.MakeFeatureLayer(copied_lyr, feat_lyr) # for hiding fields
            
    # select and rename fields to be exported based on language selection
    # note special characters are automatically changed to _ by arcpy
    if Language == "en":
        field_dict = {
            "GeographyReferenceId": "DGUID", 
            "DisplayNameLong_EN": "Location", 
            "ProvTerrName_EN": "Province_Territory", 
            "Value": "Value", 
            "NullDescription_EN": "Data_Comment"
        }
    
    else:
        field_dict = {
            "GeographyReferenceId": "IDUGD", 
            "DisplayNameLong_FR": "Endroit", 
            "ProvTerrName_FR": "Province_Territoire", 
            "Value": "Valeur", 
            "NullDescription_FR": "Commentaire"
        }
    
    # apply field dictionary to feature class with a field map
    fm = field_map_from_dict(copied_lyr, field_dict)
    ord_polys = arcpy.conversion.FeatureClassToFeatureClass(
        in_features=copied_lyr, out_path=scratch_path, out_name="ord_polys", 
        field_mapping=fm)
        
    # Hide automatically added geo fields that are not needed for output 
    desc = arcpy.Describe(feat_lyr)
    fi = desc.fieldInfo
    for i in range(0, fi.count):
        if fi.getFieldName(i) in ["OBJECTID", "Shape_Length", "Shape_Area"]:
            fi.setVisible(i, "HIDDEN")
            
    # make table view to allow export with custom field visibility
    tb_out = arcpy.management.MakeTableView(ord_polys, "tableout", "", "", fi) 
    
    # export to excel file
    # output filename also becomes worksheet name, which has 31 char limit.
    # ignoring OutputXLSX arg allows consistent filename when service is published
    arcpy.conversion.TableToExcel(tb_out, "Export.xlsx") 
    
if __name__ == '__main__':
    args = tuple(arcpy.GetParameterAsText(i) for i in range(arcpy.GetArgumentCount()))
    indicator_to_excel(*args)
    

