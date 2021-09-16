# -*- coding: utf-8 -*-
# Output the selected indicator in the selected language to a txt file.

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


def prepare_dguids(dguids):
    # dguids are comma separated, strip any space,",' and add single quotes 
    # this may not be necessary if dguids are coming in properly formatted
    dguids = dguids.replace('"', '').replace("'", "").replace(" ", "") 
    dguid_list = dguids.split(',') # convert to list
    quoted_dguids = str(dguid_list)[1:-1] # convert to quoted comma sep string
    
    return quoted_dguids
    

def indicator_to_csv(OutputCSVFile, IndicatorID, Language, DGUIDs):

    # prepare DGUIDs if present
    dguid_str = prepare_dguids(DGUIDs)

    # Process: Table Select - Get Primary Query from DB
    pq_rows = arcpy.TableSelect_analysis(
        in_table=os.path.join(csge_sde, "STC_DV.gis.IndicatorMetaData"), 
        out_table=os.path.join(scratch_path, "ind_sel"), 
        where_clause="IndicatorId = " + IndicatorID
    )
       
    # Process: Get Field Value - first row value of PrimaryQuery column
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
        
    # turn query layer into feature layer (required for altering field names)
    feat_lyr = os.path.join(scratch_path, "exp_polys")
    arcpy.CopyFeatures_management(all_polys, feat_lyr)
 
    # select and rename fields to be exported based on language selection (in order)
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
    for old_nm, new_nm in field_dict.items():
        arcpy.management.AlterField(in_table=feat_lyr, field=old_nm, new_field_name=new_nm)

    # Export CSV - semi colon delimiter is used b/c many values contain commas
    # ignoring OutputCSVFile arg allows consistent filename when service is published
    arcpy.ExportXYv_stats(Input_Feature_Class=feat_lyr, Value_Field=list(field_dict.values()), 
        Delimiter="SEMI-COLON", Output_ASCII_File="Export.txt", 
        Add_Field_Names_to_Output="ADD_FIELD_NAMES")
        
    
if __name__ == '__main__':
    args = tuple(arcpy.GetParameterAsText(i) for i in range(arcpy.GetArgumentCount()))
    indicator_to_csv(*args)
    

